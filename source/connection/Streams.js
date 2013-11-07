var _ = require('underscore'),
    Utility = require('../utility/Utility.js'),
    Stream = require('../Stream.js');

var Streams = module.exports = function (connection) {
  this.connection = connection;
  this._streamsIndex = {};
};


//--- Many test on streams are made in Connection.streams.test.js


/**
 * @param options {parentId: <parentId | null> , state: <all | null>}
 * @return Arrray of Pryv.Stream matching the options
 */
Streams.prototype.get = function (options, callback) {
  if (this.connection.datastore) {
    var resultTree = [];
    if (options && _.has(options, 'parentId')) {
      resultTree = this.connection.datastore.getStreamById(options.parentId).children;
    } else {
      resultTree = this.connection.datastore.getStreams();
    }
    callback(null, resultTree);
  } else {
    this._getObjects(options, callback);
  }
};

/**
 * Get a Stream by it's Id.
 * Works only if localStorage is activated
 */
Streams.prototype.getById = function (streamId) {
  if (! this.connection.datastore) {
    throw new Error('Call connection.fetchStructure before, to get automatic stream mapping');
  }
  return this.connection.datastore.getStreamById(streamId);
};


/**
 * @private
 */
Streams.prototype._getObjects = function (options, callback) {
  options = options || {};
  options.parentId = options.parentId || null;
  var streamsIndex = {};
  var resultTree = [];
  this._getData(options, function (error, treeData) {
    if (error) { return callback('Stream.get failed: ' + error); }
    Streams.Utils.walkDataTree(treeData, function (streamData) {
      var stream = new Stream(this.connection, streamData);
      streamsIndex[streamData.id] = stream;
      if (stream.parentId === options.parentId) { // attached to the rootNode or filter
        resultTree.push(stream);
        stream._parent = null;
        stream._children = [];
      } else {
        // localStorage will cleanup  parent / children link if needed
        stream._parent =  streamsIndex[stream.parentId];
        stream._parent._children.push(stream);
      }
    }.bind(this));
    callback(null, resultTree);
  }.bind(this));
};

Streams.prototype._getData = function (opts, callback) {
  var url = opts ? '/streams?' + Utility.getQueryParametersString(opts) : '/streams';
  this.connection.request('GET', url, callback, null);
};

Streams.prototype.create = function (stream, callback) {
  var url = '/streams';
  this.connection.request('POST', url, function (err, result) {
    stream.id = result.id;
    callback(err, result);
  }, stream);
};

Streams.prototype.update = function (stream, callback) {
  var url = '/streams/' + stream.id;
  this.connection.request('PUT', url, callback, null);
};

/**
 * Walk the tree structure..
 * parents are always announced before childrens
 * @param opts
 * @param eachStream
 * @param done
 */
Streams.prototype.walkTree = function (options, eachStream, done) {
  this.get(options, function (error, result) {
    if (error) { return done('Stream.walkTree failed: ' + error); }
    Streams.Utils.walkObjectTree(result, eachStream);
    if (done) { done(null); }
  });
};

Streams.prototype.getFlatenedObjects = function (options, callback) {
  var result = [];
  this.walkTree(options,
    function (stream) { // each stream
    result.push(stream);
  }, function (error) {  // done
    if (error) { return callback(error); }
    callback(null, result);
  }.bind(this));
};


/**
 * Utility to debug a tree structure
 */
Streams.prototype.getDisplayTree = function (arrayOfSTream) {
  return Streams.Utils._debugTree(arrayOfSTream);
};


// TODO Validate that it's the good place for them .. Could have been in Stream or Utility
Streams.Utils = {


  /**
   * Walk thru a streamArray of objects
   * @param streamTree
   * @param callback function(stream)
   */
  walkObjectTree : function (streamArray, eachStream) {
    _.each(streamArray, function (stream) {
      eachStream(stream);
      Streams.Utils.walkObjectTree(stream.children, eachStream);
    });
  },

  /**
   * Walk thru a streamTree obtained from the API. Replaces the children[] by childrenIds[].
   * This is used to Flaten the Tree
   * @param streamTree
   * @param callback function(streamData, subTree)  subTree is the descendance tree
   */
  walkDataTree : function (streamTree, callback) {
    _.each(streamTree, function (streamStruct) {
      var stream = _.omit(streamStruct, 'children');
      stream.childrenIds = [];
      var subTree = {};
      callback(stream, subTree);
      if (_.has(streamStruct, 'children')) {
        subTree = streamStruct.children;

        _.each(streamStruct.children, function (childTree) {
          stream.childrenIds.push(childTree.id);
        });
        this.walkDataTree(streamStruct.children, callback);
      }
    }.bind(this));
  },


  /**
   * ShowTree
   */
  _debugTree : function (arrayOfStreams) {
    var result = [];
    if (! arrayOfStreams  || ! arrayOfStreams instanceof Array) {
      throw new Error('expected an array for argument :' + arrayOfStreams);
    }
    _.each(arrayOfStreams, function (stream) {
      if (! stream || ! stream instanceof Stream) {
        throw new Error('expected a Streams array ' + stream);
      }
      result.push({
        name : stream.name,
        id : stream.id,
        parentId : stream.parentId,
        children : Streams.Utils._debugTree(stream.children)
      });
    });
    return result;
  }

};
