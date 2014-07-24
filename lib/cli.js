/**
 * Module dependencies.
 */

var program = require('commander')
  , sprintf = require('util').format
  , path = require('path')
  , fs = require('fs')
  , glob = require('glob')
  , resolve = path.resolve
  , exists = fs.existsSync || path.existsSync
  , Nose = require('../')
  , utils = Nose.utils
  , interfaces = Nose.interfaces
  , join = path.join
  , basename = path.basename
  , cwd = process.cwd()
  , nose = new Nose;


// options

program
  .version(JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version)
  .usage('[debug] [options] [files]')
  .option('-A, --async-only', "force all smells to take a callback (async)")
  .option('-C, --no-colors', 'force disabling of colors')
  .option('-G, --growl', 'enable growl notification support')
  .option('-R, --reporter <name>', 'specify the reporter to use', 'spec')
  .option('-c, --colors', 'force enabling of colors')
  .option('-d, --debug', "enable node's debugger, synonym for node --debug")
  .option('--reporters', 'display available reporters')


program.name = 'nose';

// init command
/*
program
  .command('init <path>')
  .description('initialize a client-side mocha setup at <path>')
  .action(function(path){
    var mkdir = require('mkdirp');
    mkdir.sync(path);
    var css = fs.readFileSync(join(__dirname, '..', 'mocha.css'));
    var js = fs.readFileSync(join(__dirname, '..', 'mocha.js'));
    var tmpl = fs.readFileSync(join(__dirname, '..', 'lib/template.html'));
    fs.writeFileSync(join(path, 'mocha.css'), css);
    fs.writeFileSync(join(path, 'mocha.js'), js);
    fs.writeFileSync(join(path, 'tests.js'), '');
    fs.writeFileSync(join(path, 'index.html'), tmpl);
    process.exit(0);
  });

// --globals

program.on('globals', function(val){
  globals = globals.concat(list(val));
});
*/

// --reporters

program.on('reporters', function(){
  console.log();
  console.log('    dot - dot matrix');
  console.log('    doc - html documentation');
  console.log('    spec - hierarchical spec list');
  console.log('    json - single json object');
  console.log('    progress - progress bar');
  console.log('    list - spec-style listing');
  console.log('    tap - test-anything-protocol');
  console.log('    landing - unicode landing strip');
  console.log('    xunit - xunit reporter');
  console.log('    html-cov - HTML test coverage');
  console.log('    json-cov - JSON test coverage');
  console.log('    min - minimal reporter (great with --watch)');
  console.log('    json-stream - newline delimited json events');
  console.log('    markdown - markdown documentation (github flavour)');
  console.log('    nyan - nyan cat!');
  console.log();
  process.exit();
});
