
/**
 * Module dependencies.
 */

var DataNode = require('./DataNode'),
    TraversalMixin = require('./mixins/TraversalMixin');

/**
 * Expose `TreeNode`.
 */

exports = module.exports = TreeNode;

/**
 * Initialize a new TreeNode.
 *
 * @constructor
 * @param {AST node} node
 * @api public
 */

function TreeNode (node) {
    this.dataNode = new DataNode(node);
    this.children = [];
    this.parent = null;
};

TreeNode.prototype.getDataNode = function () {
    return this.dataNode;
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

TreeNode.prototype.getSiblings = function () {
    var parent = this.getParentNode(),
        siblings = parent.getChildren(),
        self = this;

    return siblings.filter(function (node) {
        return node !== self;
    });
};

/**
 * Mix `TraversalMixin`
 */

TraversalMixin.call(TreeNode.prototype);
