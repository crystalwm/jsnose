
/**
 * Module dependencies.
 */

var TraversalMixin = require('./mixins/TraversalMixin');

/**
 * Expose `TreeNode`.
 */

exports = module.exports = TreeNode;

/**
 * Initialize a new TreeNode.
 *
 * @constructor
 * @param {AST node} data
 * @api public
 */

function TreeNode (data) {
    this.data = data;
    this.children = [];
    this.parent = null;
};

TreeNode.prototype.setParentNode = function (node) {
    this.parent = node;
};

TreeNode.prototype.getParentNode = function () {
    return this.parent;
};

TreeNode.prototype.addChild = function (node) {
    node.setParentNode(this);
    this.children[this.children.length] = node;
};

TreeNode.prototype.getChildren = function () {
    return this.children;
};

TreeNode.prototype.removeChildren = function () {
    this.children = [];
};

/**
 * Mix `TraversalMixin`
 */

TraversalMixin.call(TreeNode.prototype);
