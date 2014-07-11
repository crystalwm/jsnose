'use strict';

var extend = require('allong.es').allong.es.extend;

/**
 * [JavaScriptObjectInfo description]
 * @param {[type]} config [description]
 * @constructor
 */
var JavaScriptObjectInfo = function (config) {
    this._type = '';
    this._prototype = '';
    this._jsFileName = '';

    this._ownProperties = [];              // properties that are defined for the object
    this._inheritedPropetries = [];        // properties that are used but not defined for the object
    this._usedInheritedProperties = [];    // Inherited properties used or override
    this._notUsedInheritedProperties = []; // Inherited properties not used or override
    this._usedProperties = []; // Properties which are used (in the right hand side) which might be own or inherited

    this.name = config.name || '';
    this.ASTdepth = config.ASTNodeDepth || 0;
    this.lineNumber = config.lineNumber || 0;
};

/**
 * [setType description]
 * @param {string} type [description]
 */
JavaScriptObjectInfo.prototype.setType = function (type) {
    this._type = type;
};

/**
 * [addOwnProperty description]
 * @param {string} p [description]
 */
JavaScriptObjectInfo.prototype.addOwnProperty = function (p) {
    if (this._ownProperties.indexOf(p) === -1) {
        this._ownProperties.push(p);
    }
};

/**
 * [addInheritedPropetries description]
 * @param {string} p [description]
 */
JavaScriptObjectInfo.prototype.addInheritedProperty = function (p) {
    if (this._inheritedProperties.indexOf(p) === -1) {
        this._inheritedProperties.push(p);
    }
};

/**
 * [addUsedProperty description]
 * @param {string} p [description]
 */
JavaScriptObjectInfo.prototype.addUsedProperty = function (p) {
    if (this._usedProperties.indexOf(p) === -1) {
        this._usedProperties.push(p);
    }
};

/**
 * [setPrototype description]
 * @param {string} p [description]
 */
JavaScriptObjectInfo.prototype.setPrototype = function (p) {
    this._prototype = p;
};

JavaScriptObjectInfo.prototype.getPrototype = function () {
    return this._prototype;
};

JavaScriptObjectInfo.prototype.getName = function () {
    return this.name;
};

JavaScriptObjectInfo.prototype.getASTDepth = function () {
    return this.ASTdepth;
};

JavaScriptObjectInfo.prototype.toString = function () {
    return "Object name:" + this.name + "\n" +
           "Own properties:" + this._ownProperties +"\n" +
           "Inherited properties:" + this._inheritedProperties +"\n" +
           "Used properties:" + this._usedProperties +"\n" +
           "Used inherited properties:" + this._usedInheritedProperties +"\n" +
           "Not used inherited properties:" + this._notUsedInheritedProperties +"\n" +
           "Prototype object: " + this._prototype +"\n" ;
};

JavaScriptObjectInfo.prototype.getOwnProperties = function () {
    return this._ownProperties;
};

JavaScriptObjectInfo.prototype.setOwnProperties = function (ownProperties) {
    this._ownProperties = ownProperties;
};

JavaScriptObjectInfo.prototype.getInheritedProperties = function () {
    return this._ownProperties;
};

JavaScriptObjectInfo.prototype.setInheritedProperties = function (inheritedProperties) {
    this._inheritedProperties = inheritedProperties;
};

JavaScriptObjectInfo.prototype.getUsedInheritedProperties = function () {
    return this._usedInheritedProperties;
};

JavaScriptObjectInfo.prototype.setUsedInheritedProperties = function (usedInheritedProperties) {
    this._usedInheritedProperties = usedInheritedProperties;
};

module.exports = JavaScriptObjectInfo;
