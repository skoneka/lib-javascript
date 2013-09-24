
var _ = require('underscore'),
  Utility = require('../utility/Utility.js'),
  Stream = require('../Stream.js');

var Streams = module.exports = function (connection) {
  this.connection = connection;
};

Streams.prototype.get = function (callback, opts, context) {
  opts = opts || {};

  if (this.connection.datastore) {
    var result = null;
    if (_.has(opts, 'parentId')) {
      if (! _.has(this.connection.datastore.streamsIndex, opts.parentId)) { // ERROR
        return callback('streams.get cannot find parent stream with id: ' + opts.parentId, null);
      }

      // TODO
      throw new Error('localStorage does not implement caching correctly');
      // result = this.connection.datastore.getStreamById(opts.parentId).getSubTree(state);
    } else {
      result = this.connection.datastore.streams;
    }


    if (_.has(opts, 'state') && opts.state !== 'all') {
      //TODO  implement structure filtering for local storage
      throw new Error('localStorage does not implement structure filtering yet');
    }

    callback(null, result);
  }
  this._get(callback, opts, context);
};


Streams.prototype._get = function (callback, opts, context) {
  var url = opts ? '/streams?' + Utility.getQueryParametersString(opts) : '/streams';
  this.connection.request('GET', url, callback, null, context);
};

Streams.prototype.getFlatenedData = function (callback, opts, context) {
  var self = this;
  this.get(function (error, result) {
    if (error) { return callback(error); }
    callback(null, self.Utils.flatenTree(result));
  }, opts, context);
};

Streams.prototype.getFlatenedObjects = function (callback, opts, context) {
  var self = this;
  this.get(function (error, result) {
    if (error) { return callback(error); }
    callback(null, self.Utils.flatenTree(result, self.connection));
  }, opts, context);
};

Streams.prototype.create = function (stream, callback, context) {
  var url = '/streams';
  this.connection.request('POST', url, function (err, result) {
    stream.id = result.id;
    callback(err, result);
  }, stream, context);
};

Streams.prototype.update = function (stream, callback, context) {
  var url = '/streams/' + stream.id;
  this.connection.request('PUT', url, callback, null, context);
};


// TODO Validate that it's the good place for them .. Could have been in Stream or Utility
Streams.prototype.Utils = {


  /**
   * Flaten a streamTree obtained from the API. Replaces the children[] by a childrenIds[]
   * @param streamTree
   * @param andGetStreamObjects if true return Stream object as in the model
   * @returns {Array} of streamData
   */
  flatenTree : function (streamTree, andMakeObjectWithConnection) {
    var streams = [];
    this.walkDataTree(streamTree, function (stream) {
      if (andMakeObjectWithConnection) {
        streams.push(new Stream(andMakeObjectWithConnection, stream));
      } else {
        streams.push(stream);
      }
    });
    return streams;
  },

  /**
   * Walk thru a streamTree obtained from the API. Replaces the children[] by childrenIds[].
   * This is used to Flaten the Tree
   * @param streamTree
   * @param callback function(streamData, subTree)  subTree is the descendance tree
   */
  walkDataTree : function (streamTree, callback) {
    var self = this;
    _.each(streamTree, function (streamStruct) {
      var stream = _.omit(streamStruct, 'children', 'clientData');
      stream.childrenIds = [];
      var subTree = {};
      if (_.has(streamStruct, 'children')) {
        subTree = streamStruct.children;
        _.each(streamStruct.children, function (childTree) {
          stream.childrenIds.push(childTree.id);
        });
        self.walkDataTree(streamStruct.children, callback);
      }
      callback(stream, subTree);
    });
  }

};
