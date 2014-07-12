'use strict';

var extend = require('allong.es').allong.es.extend;

/**
 * [FunctionInfo description]
 * @param {[type]} config [description]
 * @constructor
 */
var FunctionInfo = function (config) {
    this.name = config.name || '';
    this.numberOfParameters = config.numberOfParameters || 0;
    this.linesOfCode = config.linesOfCode;
    this.lineNumber = config.lineNumber || 0;
};

FunctionInfo.prototype.getName = function () {
    return this.name;
};

FunctionInfo.prototype.setName = function (name) {
    this.name = name;
};

FunctionInfo.prototype.getNumberOfParameters = function () {
    return this.numberOfParameters;
};

FunctionInfo.prototype.setNumberOfParameters = function (numberOfParameters) {
    this.numberOfParameters = numberOfParameters;
};

FunctionInfo.prototype.getLinesOfCode = function () {
    return this.linesOfCode;
};

FunctionInfo.prototype.setLinesOfCode = function (linesOfCode) {
    this.linesOfCode = linesOfCode;
};

FunctionInfo.prototype.getLineNumber = function () {
    return this.lineNumber;
};

FunctionInfo.prototype.setLineNumber = function (lineNumber) {
    this.lineNumber = lineNumber;
};

module.exports = FunctionInfo;
