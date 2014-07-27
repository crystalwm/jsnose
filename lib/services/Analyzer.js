
/**
 * Module dependencies.
 */

var utils = require('../utils'),
    DataNode = require('../models/DataNode');

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
    var node = new DataNode(node);
    if (node.isFunction()) {
        // calculate length of scope chain (LSC)
        calculateLSC(node);
    };
};

Analyzer.prototype.calculateLSC = function (node) {
     var fns = getParentsOfType(node, 'FunctionDeclaration'),
         LSC = fns.length,
         detectionCriteria = smells.closureSmell.detectionCriteria;

    if ( detectionCriteria(LSC) ) {
        reporter.LSC += 1;
        console.info('For function %s nested level is %d at line %d', node.data.id && node.data.id.name, fns.length, node.data.loc.start.line);
    }
}

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
