
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
  this.emit('file analyzed');
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

  // magic happens here
  this.__tree.traverseDown(this.__run.bind(this));

  debug('finished running');
  this.emit('end');

  // uncaught exception
  process.on('uncaughtException', uncaught);

  return this;
};

Analyzer.prototype.getResults = function () {
  return this.__results;
};

Analyzer.prototype.__run = function (node) {
    if (node.getDataNode().isFunction()) {
        // calculate length of scope chain (LSC)
        this.calculateLSC(node);
    };
};

/**
 * Detect the given `smell`.
 *
 * @param {Test} test
 * @param {Error} err
 * @api private
 */

Analyzer.prototype.detected = function (smell, err) {
  ++this.smells;
  //smell.state = 'smelled';

  if ('string' == typeof err) {
    err = new Error('the string "' + err + '" was thrown, throw an Error :)');
  }

  this.emit('smell detected', smell, err);
};


/**
 * Handle uncaught exceptions.
 *
 * @param {Error} err
 * @api private
 */

Analyzer.prototype.uncaught = function (err) {

  if (err) {
    debug('uncaught exception %s', err.message);
  } else {
    debug('uncaught undefined exception');
    err = new Error('Catched undefined error, did you throw without specifying what?');
  }

  /*
  var runnable = this.currentRunnable;
  if (!runnable || 'failed' == runnable.state) return;
  runnable.clearTimeout();
  err.uncaught = true;
  this.fail(runnable, err);

  // recover from test
  if ('test' == runnable.type) {
    this.emit('test end', runnable);
    this.hookUp('afterEach', this.next);
    return;
  }
  */

  // bail on hooks
  this.emit('end');
};

Analyzer.prototype.calculateLSC = function (node) {
  var fns = this.getParentsOfType(node, 'FunctionDeclaration'),
      LSC = fns.length;
      detectionCriteria = smells.closureSmell.detectionCriteria,
      node = node.getDataNode().data;
  if ( detectionCriteria(LSC) ) {
    var smell = {
      type: 'Closure Smell',
      line: node.loc.start.line,
      file: this.__file,
      description: '  For function ' + (node.id && node.id.name) + ' nested level is ' + fns.length
    };
    this.detected(smell, new Error('smell detected: ' + smell.type));
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
