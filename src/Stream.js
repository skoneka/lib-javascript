
var _ = require('underscore');

var Stream = module.exports = function (connection, data) {
  this.connection = connection;
  _.extend(this, data);

  /** those are only used when no datastore **/
  this._parent = null;
  this._children = [];

};



Object.defineProperty(Stream.prototype, 'parent', {
  get: function () {

    if (! this.parentId) { return null; }

    if (! this.connection.datastore) { // we use this._parent and this._children
      return this._parent;
    }

    return this.connection.datastore.getStreamById(this.parentId);
  },
  set: function () { throw new Error('Stream.children property is read only'); }
});


Object.defineProperty(Stream.prototype, 'children', {
  get: function () {
    var self = this;

    if (! self.connection.datastore) { // we use this._parent and this._children
      return this._children;
    }
    var children = [];
    _.each(this.childrenIds, function (childrenId) {
      var child = self.connection.datastore.getStreamById(childrenId);
      children.push(child);
    });
    return children;
  },
  set: function () { throw new Error('Stream.children property is read only'); }
});

// TODO write test
Object.defineProperty(Stream.prototype, 'ancestors', {
  get: function () {
    var self = this;

    if (! self.parentId) { return []; }

    var result = [this.parent];
    result.push(this.parent.ancestors);
    return result;
  },
  set: function () { throw new Error('Stream.ancestors property is read only'); }
});
