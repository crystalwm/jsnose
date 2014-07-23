/*
 * nose
 * https://github.com/codelinks/jsnose
 *
 * Copyright (c) 2014 lucianlature
 * Licensed under the MIT license.
 */

'use strict';

var esprima = require('esprima'),
    estraverse = require('estraverse'),
    _ = require('underscore-contrib'),
    smellDetector = require('./smell_detector'),
    __Node = require('./__node'),
    fs = require('fs'),
    path = require('path'),
    samplesDir = path.join(__dirname + '/../_smells'),
    samples = fs.readdirSync(samplesDir),

    smells = smellDetector.smells,
    levels = smellDetector.levels,
    metrics = smellDetector.metrics,
    reporter = smellDetector.reporter,

    scopeChain = [],
    assignments = [],
    shortname = '',

    __tree = new __Node({__id: "root"}),
    __nodesRegister = {},

    calculateLSC = calculateMetric('LSC'),
    nodesWalker = _.walk(function(node) {
        return node.children;
    });

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

function calculateMetric (metric) {
    return function () {
        // do something with the metric
    }
}

function _traverseDown (context, iterator) {
    var doContinue = true;

    (function walkDown (node) {

      var i, newContext;

      if (!doContinue) return;

      if (iterator(node) === false) {
        // break the traversal loop if the iterator returns a falsy value
        doContinue = false;
      }
      else {
        for (i = 0; i < node.children.length; i++) {
          newContext = node.children[i];
          walkDown(newContext);
        }
      }
    })(context);
  }


function _traverseUp (context, iterator) {
    var i, node, doContinue;

    while (context) {
        if ( iterator(context) === false ) return;

        for (i = 0; i < context.children.length; i++) {
            node = context.children[i];
            if ( iterator(node) === false ) return;
        }
        context = context.parent;
    }
}


function _traverse (context, iterator, callback) {
    var visited = [],
        callIterator = function (node) {
            var id = node.data.__id,
                returned;

            if (! (visited.indexOf(id) > -1)) {
                returned = iterator.call(node, node);
                visited.push(id);

                if (returned === false) {
                    return returned;
                }
            }
        },
        i, node;

    callback(context, callIterator);
}

function traverseUp (context, iterator) {
    _traverse(context, iterator, _traverseUp);
}

function traverseDown (context, iterator) {
    _traverse(context, iterator, _traverseDown);
}

function isFunction (node) {
    return node.type === 'FunctionDeclaration';
}

function isObject (node) {
    // check if node is an object
}

function isCodeBlock (node) {
    // check if node is a code block
}

function isFile (node) {
    return node.type === 'Program';
}

function createsNewScope (node) {
  return node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'Program';
}

function printScope (scope, node) {
  var varsDisplay = scope.join(', ');
  /*
  if (node.type === 'Program'){
    console.log('Functions declared in the global scope:',
      varsDisplay);
  } else {
    if (node.id && node.id.name){
      console.log('Functions declared in the function ' + node.id.name + '():',
        varsDisplay);
    } else {
      console.log('Functions declared in anonymous function:',
        varsDisplay);
    }
  }
  */
}

function isVarDefined (varname, scopeChain) {
    var i = 0;

    for (; i < scopeChain.length; i++){
        var scope = scopeChain[i];
        if (scope.indexOf(varname) !== -1) {
            return true;
        }
    }
    return false;
}

function checkForLeaks (assignments, scopeChain) {
    var i = 0;

    for (; i < assignments.length; i++) {
        if (!isVarDefined(assignments[i], scopeChain)) {
            console.log('Detected leaked global variable:', assignments[i]);
        }
    }
}

function assignUUID (node) {
    node.__id = generateUUID();
}

function buildTree (node, parent) {
    var newNode, parentNode, i;

    var __nodeId = node.__id,
        __parentId = parent ? parent.__id : null;

    if (!(__nodeId in __nodesRegister)) {
        __nodesRegister[__nodeId] = new __Node(node);
    }

    if (!(__parentId in __nodesRegister)) {
        __nodesRegister[__parentId] = new __Node(parent);
    }

    __nodesRegister[__parentId].addChild(__nodesRegister[__nodeId]); // add child to parent's children
    __nodesRegister[__nodeId].setParentNode(__nodesRegister[__parentId]); // mark child as parent's child

    if (!parent) {
        __tree.addChild(__nodesRegister[__nodeId]);
    }
}


samples.forEach(function (sample) {
    shortname = samplesDir + "/" + sample;
    try {
        console.log('Processing %s', sample);
        var content = fs.readFileSync(shortname, 'utf-8'),
            // get abstract syntax tree
            ast = esprima.parse(content, { /*tolerant: true, loc: true, range: true*/ });

        // traverse ast and assign unique ID to each node
        estraverse.traverse(ast, {
            enter: assignUUID
        });

        // traverse ast and build a real tree data structure based on it
        estraverse.traverse(ast, {
            enter: buildTree
        });

        traverseDown(__tree, analyze);

    } catch (error) {
        console.error(error);
    }
})

function analyze (node) {
    // do something with the node
    console.info(node.data.type);
}

/**
var root = new Node('root');
root.addChild(new Node('child 0'));
root.addChild(new Node('child 1'));
var children = root.getChildren();
for(var i = 0; i < children.length; i++) {
    for(var j = 0; j < 5; j++) {
        children[i].addChild(new Node('second level child ' + j));
    }
}
*/

/*
exports.awesome = function() {
  return 'awesome';
};
*/
