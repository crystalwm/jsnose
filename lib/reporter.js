/*
***************************************
********** CODE SMELL REPORT **********
***************************************
********** CLOSURE SMELL **********
Number of occurance: 3
Item: this in closure in JS file: editor_template_js at line number: 1
Item: this in closure in JS file: editor_plugin_js at line number: 1
Item: this in closure in JS file: tiny_mce_js at line number: 1
*/
'use strict';

var intro = '\
***************************************\
********** CODE SMELL REPORT **********\
***************************************\
';

var reporter = {
    intro: intro
};

module.exports = reporter;
