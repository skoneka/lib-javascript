
var _ = require('underscore');

var Stream = module.exports = function Stream(connection, data) {
  this.connection = connection;

  this.serialId = this.connection.serialId + '>S' + this.connection._streamSerialCounter++;
  /** those are only used when no datastore **/
  this._parent = null;
  this._children = [];
  _.extend(this, data);
};

/**
 * Set or erase clientData properties
 * @example // set x=25 and delete y
 * stream.setClientData({x : 25, y : null}, function(error) { console.log('done'); });
 *
 * @param {Object} keyValueMap
 * @param {Connection~requestCallback} callback
 */
Stream.prototype.setClientData = function (keyValueMap, callback) {
  return this.connection.streams.setClientData(this, keyValueMap, callback);
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
    if (! this.connection.datastore) { // we use this._parent and this._children
      return this._children;
    }
    var children = [];
    _.each(this.childrenIds, function (childrenId) {
      var child = this.connection.datastore.getStreamById(childrenId);
      children.push(child);
    }.bind(this));
    return children;
  }
});

// TODO write test
Object.defineProperty(Stream.prototype, 'ancestors', {
  get: function () {
    if (! this.parentId || this.parent === null) { return []; }
    var result = this.parent.ancestors;
    result.push(this.parent);
    return result;
  },
  set: function () { throw new Error('Stream.ancestors property is read only'); }
});






