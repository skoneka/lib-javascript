
var _ = require('underscore'),
  Utility = require('../utility/Utility.js'),
  Stream = require('../Stream.js');

var Streams = module.exports = function (connection) {
  this.connection = connection;
};


/**
 * @param options {parentId: <parentId | null> , state: <all | null>}
 */
Streams.prototype.walkTree = function (options, foundStream, done, context) {
  options = options || { };

  done();
};



/**
 * @param options {parentId: <parentId | null> , state: <all | null>}
 */
Streams.prototype.tree = function (options, callback, context) {
  options = options || { };

  done();
};

/**
 * @param options {parentId: <parentId | null> , state: <all | null>}
 * @return Arrray of Pryv.Stream matching the options
 */
Streams.prototype.get = function (callback, options, context) {
  options = options || {};
  options.parentId = options.parentId || null;
  var self = this;
  if (this.connection.datastore) {
    // do otherwise
    console.log('todo');
  }


  var resultTree = [];
  var streamsIndex = {};
  this._get(options, function (error, treeData) {
    if (error) { return callback('Stream.get failed: ' + error); }
    Streams.Utils.walkDataTree(treeData, function (streamData) {
      var stream = new Stream(self.connection, streamData);
      streamsIndex[streamData.id] = stream;
      if (stream.parentId === options.parentId) { // attached to the rootNode or filter
        resultTree.push(stream);
      }
    });

    callback(null, resultTree);
  }, context);

};



Streams.prototype._get = function (opts, callback, context) {
  var url = opts ? '/streams?' + Utility.getQueryParametersString(opts) : '/streams';
  this.connection.request('GET', url, callback, null, context);
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
Streams.Utils = {


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
