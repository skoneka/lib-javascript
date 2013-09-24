
var _ = require('underscore');

var Stream = module.exports = function (connection, data) {
  this.connection = connection;
  _.extend(this, data);
};


Object.defineProperty(Stream.prototype, 'parents', {
  get: function () {
    var self = this;

    if (! self.parentId) { return []; }
    var parent = self.connection.datastore.getStreamById(self.parentId);
    var parents = parent.parents;
    parents.push(parent);
    return parents;
  },
  set: function () { throw new Error('Stream.parents property is read only'); }
});

Object.defineProperty(Stream.prototype, 'parentsIds', {
  get: function () {
    var self = this;

    if (! self.parentId) { return []; }
    var parent = self.connection.datastore.getStreamById(self.parentId);
    var parents = parent.parentsIds;
    parents.push(self.parentId);
    return parents;
  },
  set: function () { throw new Error('Stream.parents property is read only'); }
});

Object.defineProperty(Stream.prototype, 'children', {
  get: function () {
    var self = this;
    var children = [];
    _.each(this.childrenIds, function (childrenId) {
      children.push(self.connection.datastore.getStreamById(childrenId));
    });
    return children;
  },
  set: function () { throw new Error('Stream.children property is read only'); }
});

