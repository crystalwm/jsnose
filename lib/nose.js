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
  , _ = require('underscore-contrib');

var smellDetector = require('./smell_detector'),
    // reporter = require('./reporter'),
    __reporter = null,
    __Node = require('./__node'),
    samplesDir = path.join(__dirname + '/../_smells'),
    samples = fs.readdirSync(samplesDir),

    smells = smellDetector.smells,
    levels = smellDetector.levels,
    metrics = smellDetector.metrics,
    aggregator = smellDetector.aggregator,

    scopeChain = [],
    assignments = [],
    shortname = '',

    __tree = new __Node({__id: "root"}),
    __nodesRegister = {},

    // calculateLSC = calculateMetric('LSC'),
    nodesWalker = _.walk(function(node) {
        return node.children;
    });


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
exports.reporters = require('./reporters');

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

        reporter = reporter || 'spec';

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
 * Run tests and invoke `callback()` when complete.
 *
 * @param {Function} fn
 * @return {Runner}
 * @api public
 */

Nose.prototype.run = function run (callback) {
  console.log('run');
  /*
  if (this.files.length) this.loadFiles();
  var suite = this.suite;
  var options = this.options;
  options.files = this.files;
  var runner = new exports.Runner(suite);
  var reporter = new this._reporter(runner, options);
  runner.ignoreLeaks = false !== options.ignoreLeaks;
  runner.asyncOnly = options.asyncOnly;
  if (options.grep) runner.grep(options.grep, options.invert);
  if (options.globals) runner.globals(options.globals);
  if (options.growl) this._growl(runner, reporter);
  exports.reporters.Base.useColors = options.useColors;
  exports.reporters.Base.inlineDiffs = options.useInlineDiffs;
  return runner.run(fn);
  */
};

function generateUUID () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

function calculateLSC (node) {
     var fns = getParentsOfType(node, 'FunctionDeclaration'),
         LSC = fns.length,
         detectionCriteria = smells.closureSmell.detectionCriteria;

    if ( detectionCriteria(LSC) ) {
        reporter.LSC += 1;
        console.info('For function %s nested level is %d at line %d', node.data.id && node.data.id.name, fns.length, node.data.loc.start.line);
    }
}

function _traverseDown (context, iterator) {
    var doContinue = true;

    (function walkDown (node) {

      var i, newContext;

      if (!doContinue) return;

      if (iterator(node) === false) {
        // break the traversal loop if the iterator returns a falsy value
        doContinue = false;
      }
      else {
        for (i = 0; i < node.children.length; i++) {
          newContext = node.children[i];
          walkDown(newContext);
        }
      }
    })(context);
  }


function _traverseUp (context, iterator) {
    var i, node, doContinue;

    while (context) {
        if ( iterator(context) === false ) return;

        for (i = 0; i < context.children.length; i++) {
            node = context.children[i];
            if ( iterator(node) === false ) return;
        }
        context = context.parent;
    }
}


function _traverse (context, iterator, callback) {
    var visited = [],
        callIterator = function (node) {
            var id = node.data.__id,
                returned;

            if (! (visited.indexOf(id) > -1)) {
                returned = iterator.call(node, node);
                visited.push(id);

                if (returned === false) {
                    return returned;
                }
            }
        },
        i, node;

    callback(context, callIterator);
}

function traverseUp (context, iterator) {
    _traverse(context, iterator, _traverseUp);
}

function traverseDown (context, iterator) {
    _traverse(context, iterator, _traverseDown);
}

function isFunction (node) {
    return node.type === 'FunctionDeclaration';
}

function isObject (node) {
    // check if node is an object
}

function isCodeBlock (node) {
    // check if node is a code block
}

function isFile (node) {
    return node.type === 'Program';
}

function createsNewScope (node) {
  return node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'Program';
}

function printScope (scope, node) {
  var varsDisplay = scope.join(', ');
  /*
  if (node.type === 'Program'){
    console.log('Functions declared in the global scope:',
      varsDisplay);
  } else {
    if (node.id && node.id.name){
      console.log('Functions declared in the function ' + node.id.name + '():',
        varsDisplay);
    } else {
      console.log('Functions declared in anonymous function:',
        varsDisplay);
    }
  }
  */
}

function isVarDefined (varname, scopeChain) {
    var i = 0;

    for (; i < scopeChain.length; i++){
        var scope = scopeChain[i];
        if (scope.indexOf(varname) !== -1) {
            return true;
        }
    }
    return false;
}

function checkForLeaks (assignments, scopeChain) {
    var i = 0;

    for (; i < assignments.length; i++) {
        if (!isVarDefined(assignments[i], scopeChain)) {
            console.log('Detected leaked global variable:', assignments[i]);
        }
    }
}

function assignUUID (node) {
    node.__id = generateUUID();
}

function buildTree (node, parent) {
    var newNode, parentNode, i;

    var __nodeId = node.__id,
        __parentId = parent ? parent.__id : null;

    if (!(__nodeId in __nodesRegister)) {
        __nodesRegister[__nodeId] = new __Node(node);
    }

    if (!(__parentId in __nodesRegister)) {
        __nodesRegister[__parentId] = new __Node(parent);
    }

    __nodesRegister[__parentId].addChild(__nodesRegister[__nodeId]); // add child to parent's children
    __nodesRegister[__nodeId].setParentNode(__nodesRegister[__parentId]); // mark child as parent's child

    if (!parent) {
        __tree.addChild(__nodesRegister[__nodeId]);
    }
}

function getParentsOfType (node, type) {
    var output = [];
    traverseUp(node, function (node) {
        if (node.data.type === type) {
            output.push(node.data);
        }
    });
    return output;
}

/*
samples.forEach(function (sample) {
    shortname = samplesDir + "/" + sample;
    try {
        console.log('Processing %s', sample);
        var content = fs.readFileSync(shortname, 'utf-8'),
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

        // console.info(__tree);

        traverseDown(__tree, analyze);

        // display report
        console.info(reporter.intro);
        Object.keys(aggregator).forEach(function (metric) {
            console.info(reporter[metric]);
        });

    } catch (error) {
        console.error(error);
    }
});
*/

function analyze (node) {
    if (isFunction(node.data)) {
        // calculate length of scope chain (LSC)
        calculateLSC(node);
    };
}
