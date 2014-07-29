/**
 * Module dependencies.
 */

var Base = require('./Base')
  , cursor = Base.cursor
  , color = Base.color;

/**
 * Expose `Spec`.
 */

exports = module.exports = Spec;

/**
 * Initialize a new `Spec` test reporter.
 *
 * @param {Analyzer} analyzer
 * @api public
 */

function Spec (analyzer) {
  Base.call(this, analyzer);

  var self = this
    , stats = this.stats
    , indents = 0
    , n = 0;

  function indent () {
    return Array(indents).join('  ')
  }

  analyzer.on('start', function () {
    console.log();
  });

  analyzer.on('end', function () {
    analyzer.on('end', self.epilogue.bind(self));
  });

  analyzer.on('smell detected', function (smell) {
    cursor.CR();
    console.log(indent() + color('smell', '  %d) %s'), ++n, smell.title);
  });

};

/**
 * Inherit from `Base.prototype`.
 */

Spec.prototype = Object.create(Base.prototype, {
    constructor: { value: Spec }
});
