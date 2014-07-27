
/**
 * Expose `DataNode`.
 */

exports = module.exports = DataNode;

/**
 * Initialize a new DataNode.
 *
 * @constructor
 * @param {lib.models.TreeNode} node
 * @api public
 */

function DataNode (node) {
    if (!node) return;
    this.node = node.data;
};

DataNode.prototype.isFunction = function (node) {
    return this.node.type === 'FunctionDeclaration';
};

DataNode.prototype.isFile = function (node) {
    return this.node.type === 'Program';
};

DataNode.prototype.isObject = function (node) {
    // check if node is an object
};

DataNode.prototype.isCodeBlock = function (node) {
    // check if node is a code block
};
