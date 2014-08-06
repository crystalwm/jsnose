
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
 * CSS properties list
 */

exports.styleProperties = {
  'background': 'background',
  'background-attachment': 'backgroundAttachment',
  'background-color': 'backgroundColor',
  'background-image': 'backgroundImage',
  'background-position': 'backgroundPosition',
  'background-repeat': 'backgroundRepeat',
  'border': 'border',
  'border-bottom': 'borderBottom',
  'border-bottom-color': 'borderBottomColor',
  'border-bottom-style': 'borderBottomStyle',
  'border-bottom-width': 'borderBottomWidth',
  'border-color': 'borderColor',
  'border-left': 'borderLeft',
  'border-left-color': 'borderLeftColor',
  'border-left-style': 'borderLeftStyle',
  'border-left-width': 'borderLeftWidth',
  'border-right': 'borderRight',
  'border-right-color': 'borderRightColor',
  'border-right-style': 'borderRightStyle',
  'border-right-width': 'borderRightWidth',
  'border-style': 'borderStyle',
  'border-top': 'borderTop',
  'border-top-color': 'borderTopColor',
  'border-top-style': 'borderTopStyle',
  'border-top-width': 'borderTopWidth',
  'border-width': 'borderWidth',
  'clear': 'clear',
  'clip': 'clip',
  'color': 'color',
  'cursor': 'cursor',
  'display': 'display',
  'filter': 'filter',
  'font': 'font',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-variant': 'fontVariant',
  'font-weight': 'fontWeight',
  'height': 'height',
  'left': 'left',
  'letter-spacing': 'letterSpacing',
  'line-height': 'lineHeight',
  'list-style': 'listStyle',
  'list-style-image': 'listStyleImage',
  'list-style-position': 'listStylePosition',
  'list-style-type': 'listStyleType',
  'margin': 'margin',
  'margin-bottom': 'marginBottom',
  'margin-left': 'marginLeft',
  'margin-right': 'marginRight',
  'margin-top': 'marginTop',
  'overflow': 'overflow',
  'padding': 'padding',
  'padding-bottom': 'paddingBottom',
  'padding-left': 'paddingLeft',
  'padding-right': 'paddingRight',
  'padding-top': 'paddingTop',
  'page-break-after': 'pageBreakAfter',
  'page-break-before': 'pageBreakBefore',
  'position': 'position',
  'float': 'styleFloat',
  'text-align': 'textAlign',
  'text-decoration': 'textDecoration',
  'text-decoration: blink': 'textDecorationBlink',
  'text-decoration: line-through': 'textDecorationLineThrough',
  'text-decoration: none': 'textDecorationNone',
  'text-decoration: overline': 'textDecorationOverline',
  'text-decoration: underline': 'textDecorationUnderline',
  'text-indent': 'textIndent',
  'text-transform': 'textTransform',
  'top': 'top',
  'vertical-align': 'verticalAlign',
  'visibility': 'visibility',
  'width': 'width',
  'z-index': 'zIndex'
};

exports.styleCSS = Object.keys(exports.styleProperties);
exports.styleJS = exports.styleCSS.map(function (key) { return exports.styleProperties[key]});

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

Analyzer.prototype.report = function () {
  this.emit('end');
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

    if (node.getDataNode().isIdentifier()) {
      // calculate JSC
      this.calculateJSC(node);
    }

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

Analyzer.prototype.calculateJSC = function (node) {

  var members = node.getSiblings(),
      node = node.getDataNode().data;

  //members.filter(function (member) {
    // var data = node.getDataNode().data;
  //  console.info(member.type);
    // return data.property.type === 'Identifier';
  // debug(members.length);
  members.forEach(function (member) {
    var data = member.getDataNode().data,
        nextMemberExpression = null,
        styleProperty = null;

    if (member.getDataNode().isMemberExpression() &&
      data.property &&
      data.property.name &&
      data.property.name === 'style') {
        // get parent
        nextMemberExpression = member.getParentNode().getParentNode();
        // get property
        styleProperty = nextMemberExpression.getDataNode().data.left.property.name;

        if (~exports.styleCSS.indexOf(styleProperty)) {
          var smell = {
            type: 'couplingJSHTMLCSS',
            line: node.loc.start.line,
            file: this.__file,
            description: '  Found CSS in JavaScript' + (node.id && node.id.name)
          };
          this.detected(smell, new Error('smell detected: ' + smell.type));
        }
    }
  }, this);
  /*,
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
  */

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

Analyzer.prototype.getChildrenOfType = function (node, type) {
  var output = [];
  node.traverseDown(function (node) {
    if (node.getDataNode().getType() === type) {
        output.push(node.getDataNode());
    }
  });
  return output;
};
