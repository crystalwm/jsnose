
/**
 * Module dependencies.
 */

var utils = require('../utils'),
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
  // do nothing yet
}

Analyzer.prototype.run = function (node) {
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
    console.info('For function %s nested level is %d at line %d', node.id && node.id.name, fns.length, node.loc.start.line);
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

    //return _.reduce(traverseUp, []);
};

/**
 * Color lines for `str`, using the color `name`.
 *
 * @param {String} name
 * @param {String} str
 * @return {String}
 * @api private
 */

function colorLines (name, str) {
  return str.split('\n').map(function (str) {
    return color(name, str);
  }).join('\n');
}
