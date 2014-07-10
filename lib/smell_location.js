'use strict';

var extend = require('allong.es').allong.es.extend;

var SmellLocation = function (config) {
    extend(this, config);
};

SmellLocation.prototype.getJsFile = function () {
    return this.jsFile;
};

SmellLocation.prototype.setJsFile = function (jsFile) {
    this.jsFile = jsFile;
};

SmellLocation.prototype.getLineNumber= function () {
    return this.lineNumber;
};

SmellLocation.prototype.setLineNumber = function (lineNumber) {
    this.lineNumber = lineNumber;
};

SmellLocation.prototype.getSmellyItemName = function () {
    return this.smellyItemName;
};

SmellLocation.prototype.setSmellyItemName = function (smellyItemName) {
    this.smellyItemName = smellyItemName;
};

/**
 * [equals description]
 * @param  {SmellLocation} sl [description]
 * @return {boolean}    [description]
 */
SmellLocation.prototype.equals = function (sl) {

    if (this === sl) return true;

    if (!(sl instanceof SmellLocation)) return false;

    if ((this.jsFile === null) ? (sl.jsFile !== null) : !(this.jsFile === sl.jsFile)) {
        return false;
    }

    if (this.lineNumber !== sl.lineNumber) {
        return false;
    }

    return true;
}

SmellLocation.hashCode = function () {
    return 1;
}

module.exports = SmellLocation;
