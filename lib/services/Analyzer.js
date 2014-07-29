
/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter,
    debug = require('debug')('nose:analyzer'),
    utils = require('../utils'),
    DataNode = require('../models/DataNode'),

    smellDetector = require('../smell_detector'),
    smells = smellDetector.smells,
    levels = smellDetector.levels,
    metrics = smellDetector.metrics,
    aggregator = smellDetector.aggregator;


/**
 * Expose `Analyzer`.
 */

exports = module.exports = Analyzer;

/**
 * Initialize a new analyzer.
 *
 * @api public
 */

function Analyzer () {
  this.__tree = null;
  this.__file = null;
  this.__results = [];

  // create a new detector instance
  // this.detector = new exports.Detector();
  // detector.asyncOnly = options.asyncOnly;
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Analyzer.prototype = Object.create(EventEmitter.prototype, {
    constructor: { value: Analyzer }
});

Analyzer.prototype.setTree = function (tree) {
  this.__tree = tree;
};

Analyzer.prototype.setFile = function (file) {
  this.__file = file;
};

Analyzer.prototype.run = function (fn) {
  var self = this
    , fn = fn || function() {};

  function uncaught (err) {
    self.uncaught(err);
  }

  debug('start');

  // callback
  this.on('end', function(){
    debug('end');
    process.removeListener('uncaughtException', uncaught);
    fn(self.smells);
  });

  // run detectors
  this.emit('start');
  this.__tree.traverseDown(this.__run.bind(this));
  /*
  this.runSuite(this.suite, function(){
    debug('finished running');
    self.emit('end');
  });
    */
  // uncaught exception
  process.on('uncaughtException', uncaught);

  return this;
};

Analyzer.prototype.getResults = function () {
  return this.__results;
};

// __tree.traverseDown(analyzer.run.bind(analyzer);

Analyzer.prototype.__run = function (node) {
    if (node.getDataNode().isFunction()) {
        // calculate length of scope chain (LSC)
        this.calculateLSC(node);
    };
};

Analyzer.prototype.calculateLSC = function (node) {
  var fns = this.getParentsOfType(node, 'FunctionDeclaration'),
      LSC = fns.length;
      detectionCriteria = smells.closureSmell.detectionCriteria,
      node = node.getDataNode().data;

  if ( detectionCriteria(LSC) ) {
    var result = {
      file: this.__file,
      error: 'For function ' + (node.id && node.id.name) + ' nested level is ' + fns.length + ' at line ' + node.loc.start.line
    };
    this.__results.push(result);
  }
};

Analyzer.prototype.getParentsOfType = function (node, type) {
    var output = [];
    node.traverseUp(function (node) {
        if (node.getDataNode().getType() === type) {
            output.push(node.getDataNode());
        }
    });
    return output;
};
