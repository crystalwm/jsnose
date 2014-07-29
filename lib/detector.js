
/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter
  , debug = require('debug')('nose:detector')
  //, Test = require('./test')
  , utils = require('./utils')
  , filter = utils.filter
  , keys = utils.keys;

/**
 * Expose `Detector`.
 */

module.exports = Detector;

/**
 * Initialize a `Detector` for the given `file`.
 *
 * Events:
 *
 *   - `start`  execution started
 *   - `end`  execution complete
 *   - `smell`  (smell) smell detected
 *
 * @api public
 */

function Detector () {
    this._abort = false;
    this.failures = 0;
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Detector.prototype = Object.create(EventEmitter.prototype, {
    constructor: { value: Detector }
});

/**
 * Handle uncaught exceptions.
 *
 * @param {Error} err
 * @api private
 */

Detector.prototype.uncaught = function (err) {

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

/**
 * Run the root suite and invoke `fn(failures)`
 * on completion.
 *
 * @param {Function} fn
 * @return {Detector} for chaining
 * @api public
 */

Detector.prototype.run = function (fn) {
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
    fn(self.failures);
  });

  // run suites
  this.emit('start');
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
