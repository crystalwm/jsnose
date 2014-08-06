
/**
 * Expose `DataNode`.
 */

exports = module.exports = DataNode;

/**
 * Initialize a new DataNode.
 *
 * @constructor
 * @param data
 * @api public
 */

function DataNode (nodeData) {
    if (!nodeData) return;
    this.data = nodeData;
};

DataNode.prototype.getId = function () {
    return this.data.__id;
};

DataNode.prototype.getType = function () {
    return this.data.type;
};

DataNode.prototype.isFunction = function () {
    return this.data.type === 'FunctionDeclaration';
};

DataNode.prototype.isFile = function () {
    return this.data.type === 'Program';
};

DataNode.prototype.isObject = function () {
    // check if node is an object
};

DataNode.prototype.isAssignment = function () {
    return this.data.type === 'AssignmentExpression';
};

DataNode.prototype.isIdentifier = function () {
    return this.data.type === 'Identifier';
};

DataNode.prototype.isMemberExpression = function () {
    return this.data.type === 'MemberExpression';
};

DataNode.prototype.isCodeBlock = function () {
    return this.data.type === '';
};
