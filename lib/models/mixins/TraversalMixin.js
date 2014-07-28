
/**
 * Module dependencies.
 */

var mixin = require('allong.es').allong.es.mixin,
    TraversalMixin;

/**
 * Expose `TraversalMixin`.
 * Creates `TraversalMixin`.
 *
 * @api private
 */

module.exports = TraversalMixin = mixin({

  traverseUp: function (iterator) {
    this._traverse(iterator, this._traverseUp);
  },

  traverseDown: function (iterator) {
    this._traverse(iterator, this._traverseDown);
  },

  _traverse: function (iterator, callback) {
    var visited = [],
        callIterator = function (node) {
          var id = node.getDataNode().getId(),
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

    callback(this, callIterator);
  },

  _traverseUp: function (context, iterator) {
    var i, node, doContinue;

    while (context) {
      if ( iterator(context) === false ) return;

      for (i = 0; i < context.children.length; i++) {
          node = context.children[i];
          if ( iterator(node) === false ) return;
      }
      context = context.parent;
    }
  },

  _traverseDown: function (context, iterator) {
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

});

