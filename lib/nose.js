/*
 * nose
 * https://github.com/codelinks/jsnose
 *
 * Copyright (c) 2014 lucianlature
 * Licensed under the MIT license.
 */

'use strict';

var esprima = require('esprima'),
         fs = require('fs'),
       path = require('path'),
 samplesDir = path.join(__dirname + '/../_smells'),
    samples = fs.readdirSync(samplesDir);

samples.forEach(function (sample) {
    var data = fs.readFileSync( samplesDir + "/" + sample, 'utf-8' ),
         // get AST
         ast = JSON.stringify(esprima.parse(data, {loc: true}), null, 4);
         // analyze AST
         console.info(ast);
         var report = analyze(ast);
})

function analyze (ast) {
    // do something with ast
}

/*
exports.awesome = function() {
  return 'awesome';
};
*/
