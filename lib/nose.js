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
   modifier = require(path.join(__dirname + '/modifier')),
 samplesDir = path.join(__dirname + '/../_smells'),
    samples = fs.readdirSync(samplesDir),
      first = true,
      shortname;

// Executes visitor on the object and its children (recursively).
function traverse (object, visitor) {
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

samples.forEach(function (sample) {
    shortname = samplesDir + "/" + sample;
    try {
        var content = fs.readFileSync(shortname, 'utf-8'),
            ast = esprima.parse(content, { tolerant: true, loc: true, range: true });
        traverse(ast, modifier);
    } catch (error) {
        console.error(error);
    }
})

function analyze (ast) {
    // do something with ast
}

/*
exports.awesome = function() {
  return 'awesome';
};
*/
