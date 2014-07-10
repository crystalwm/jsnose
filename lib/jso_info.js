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

    this._usedPropetries = []; // Properties which are used (in the right hand side) which might be own or inherited

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

module.exports = JavaScriptObjectInfo;
