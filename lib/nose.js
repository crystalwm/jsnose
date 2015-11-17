/*
 * Nose
 * https://github.com/codelinks/nose
 *
 * Copyright (c) 2014 Lucian Lature <lucian@codelinks.net>
 * Licensed under the MIT license.
 */

'use strict';

/**
 * Module dependencies.
 */

var path = require('path')
  //, utils = require('./utils')
  , fs = require('fs')
  , join = path.join
  , cwd = process.cwd()
  , esprima = require('esprima')
  , estraverse = require('estraverse')
  , _ = require('underscore-contrib')
  , uuid = require('node-uuid');

var reporter = require('./reporter'),
    __reporter = null,
    TreeNode = require('./models/TreeNode'),
    __tree = new TreeNode({__id: "root"}),
    __nodesRegistry = {};


/**
 * Add node_modules directory to use local modules for ui and reporters.
 */

module.paths.push(cwd, join(cwd, 'node_modules'));

/**
 * Expose `Nose`.
 */

exports = module.exports = Nose;

/**
 * Expose internals.
 */

// exports.utils = utils;
/*
exports.reporters = require('./reporters');
exports.Analyzer = require('./services').Analyzer;
exports.Detector = require('./detector');
*/

/**
 * Setup nose with `options`.
 *
 * Options:
 *
 *   - `reporter` reporter instance, defaults to `nose.reporters.spec`
 *   - `globals` array of accepted globals
 *   - `timeout` timeout in milliseconds
 *   - `bail` bail on the first test failure
 *   - `slow` milliseconds to wait before considering a test slow
 *   - `ignoreLeaks` ignore global leaks
 *   - `grep` string or regexp to filter tests with
 *
 * @param {Object} options
 * @api public
 */

function Nose (options) {
    options = options || {};
    this.files = [];
    this.options = options;
    this.reporter(options.reporter);
    this.useColors(options.useColors)
}

/**
 * Set reporter to `reporter`, defaults to "spec".
 *
 * @param {String|Function} reporter name or constructor
 * @api public
 */

Nose.prototype.reporter = function reporter (reporter) {
    var _reporter;

    if ('function' === typeof reporter) {
        this._reporter = reporter;
    } else {

        reporter = reporter || 'Spec';

        try {
            _reporter = require('./reporters/' + reporter);
        } catch (err) {};

        if (!_reporter) {
            try {
                _reporter = require(reporter);
            } catch (err) {};
        }

        if (!_reporter) throw new Error('invalid reporter "' + reporter + '"');
        this._reporter = _reporter;
    }
    return this;
};

/**
 * Emit color output.
 *
 * @param {Boolean} colors
 * @return {Nose}
 * @api public
 */

Nose.prototype.useColors = function useColors (colors) {
    this.options.useColors = arguments.length && colors != undefined
        ? colors
        : true;
    return this;
};


/**
 * Run detector and invoke `callback()` when complete.
 * Gathers all files that need to be analyzed, analyses them, sends them to
 * a reporter and returns the overall result.
 *
 * @param {Function} callback
 * @return {Detector}
 * @api public
 */

Nose.prototype.run = function run (callback) {

    if (this.files.length) this.loadFiles();
    var options = this.options;
    options.files = this.files;
    // create a new analyzer instance
    var analyzer = new exports.Analyzer();
    // create a new reporter instance
    var reporter = new this._reporter(analyzer, options);
    exports.reporters.Base.useColors = options.useColors;

    this.files.forEach(function (file) {
        try {
            var content = fs.readFileSync(file, 'utf-8'),
                // get abstract syntax tree
                ast = esprima.parse(content, { tolerant: true, loc: true, range: true });

            // traverse ast and assign unique ID to each node
            estraverse.traverse(ast, {
                enter: assignUUID
            });

            // traverse ast and build a real tree data structure based on it
            estraverse.traverse(ast, {
                enter: buildTree
            });

            analyzer.setTree(__tree);
            analyzer.setFile(file);
            analyzer.run();

            // resultsAggregator.push(analyzer.getResults());

            // rebuild an empty one for the next analysed file
            __tree = new TreeNode({__id: "root"});
            // empty node registry
            __nodesRegistry = {};

            // display report
            // console.info(reporter.intro);
            // Object.keys(aggregator).forEach(function (metric) {
            //      console.info(reporter[metric]);
            // });

        } catch (error) {
            console.error(error);
        }
    });

    analyzer.report();

    // reporter.display(resultsAggregator);

};

/**
 * Load registered files.
 *
 * @api private
 */

Nose.prototype.loadFiles = function loadFiles (

) {
    var self = this
      , suite = this.suite
      , pending = this.files.length;

    this.files.forEach(function (file) {
        file = path.resolve(file);
        --pending || (fn && fn());
    });
};

function assignUUID (node) {
    node.__id = uuid.v4();
}

function buildTree (node, parent) {
    var nodeId = node.__id,
        parentId = parent ? parent.__id : null,
        newNode, parentNode, i;

    if (!(nodeId in __nodesRegistry)) {
        __nodesRegistry[nodeId] = new TreeNode(node);
    }

    if (!(parentId in __nodesRegistry)) {
        __nodesRegistry[parentId] = new TreeNode(parent);
    }

    __nodesRegistry[parentId].addChild(__nodesRegistry[nodeId]); // add child to parent's children
    __nodesRegistry[nodeId].setParentNode(__nodesRegistry[parentId]); // mark child as parent's child

    if (!parent) {
        __tree.addChild(__nodesRegistry[nodeId]);
    }
}
