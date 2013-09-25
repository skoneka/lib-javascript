
var _ = require('underscore'),
  Utility = require('../utility/Utility.js'),
  Stream = require('../Stream.js');

var Streams = module.exports = function (connection) {
  this.connection = connection;
  this._streamsIndex = {};

};


/**
 * @param options {parentId: <parentId | null> , state: <all | null>}
 * @return Arrray of Pryv.Stream matching the options
 */
Streams.prototype.get = function (options, callback, context) {

  if (this.connection.datastore) {
    var resultTree = [];
    if (options && _.has(options, 'parentId')) {
      resultTree = this.connection.datastore.getStreamById(options.parentId).children;
    } else {
      resultTree = this.connection.datastore.getStreams();
    }
  } else {
    this._getObjects(options, callback, context);
  }
};

Streams.prototype._getObjects = function (options, callback, context) {
  options = options || {};
  options.parentId = options.parentId || null;
  var self = this;
  var streamsIndex = {};
  var resultTree = [];
  this._getData(options, function (error, treeData) {
    if (error) { return callback('Stream.get failed: ' + error); }
    Streams.Utils.walkDataTree(treeData, function (streamData) {
      var stream = new Stream(self.connection, streamData);
      streamsIndex[streamData.id] = stream;
      if (stream.parentId === options.parentId) { // attached to the rootNode or filter
        resultTree.push(stream);
        stream._parent = null;
        stream._children = [];
      } else {
        // if no localStorage create parent / children link
        stream._parent =  streamsIndex[stream.parentId];
        stream._parent._children.push(stream);
      }
    });
    callback(null, resultTree);
  }, context);
};

Streams.prototype._getData = function (opts, callback, context) {
  var url = opts ? '/streams?' + Utility.getQueryParametersString(opts) : '/streams';
  this.connection.request('GET', url, callback, null, context);
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

/**
 * Walk the tree structure..
 * parents are always announced before childrens
 * @param opts
 * @param eachStream
 * @param done
 * @param context
 */
Streams.prototype.walkTree = function (opts, eachStream, done, context) {
  this.get(function (error, result) {
    if (error) { return done('Stream.walkTree failed: ' + error); }
    Streams.Utils.walkDataTree(result, eachStream);
    done(null);
  }, opts, context);
};


Streams.prototype.getFlatenedObjects = function (callback, opts, context) {
  var self = this;
  this.get(function (error, result) {
    if (error) { return callback(error); }
    callback(null, self.Utils.flatenTree(result, self.connection));
  }, opts, context);
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
      callback(stream, subTree);
      if (_.has(streamStruct, 'children')) {
        subTree = streamStruct.children;

        _.each(streamStruct.children, function (childTree) {
          stream.childrenIds.push(childTree.id);
        });
        self.walkDataTree(streamStruct.children, callback);
      }
    });
  }

};
