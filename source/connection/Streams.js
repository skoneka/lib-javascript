var _ = require('underscore'),
    Utility = require('../utility/Utility.js'),
    Stream = require('../Stream.js');


/**
 * @class Pryv.Streams
 *
 * Coverage of the API
 *  GET /streams -- 100%
 *  POST /streams -- only data (no object)
 *  PUT /streams -- 0%
 *  DELETE /streams/{stream-id} -- 0%
 *
 *
 *
 * @param connection
 * @constructor
 */
function Streams(connection) {
  this.connection = connection;
  this._streamsIndex = {};
}



/**
 * @typedef {Object} Pryv.Streams~options parameters than can be passed allong a Stream request
 * @property {string} parentId  if parentId is null you will get all the "root" streams.
 * @property {string} [state] 'all' || null  - if null you get only "active" streams
 **/


/**
 * @param {Pryv.Streams~options} options
 * @param {Pryv.Streams~getCallback} callback - handles the response
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
 * Works only if fetchStructure has been done once.
 * @param {string} streamId
 * @throws {Error} Pryv.Connection.fetchStructure must have been called before.
 */
Streams.prototype.getById = function (streamId) {
  if (! this.connection.datastore) {
    throw new Error('Call connection.fetchStructure before, to get automatic stream mapping');
  }
  return this.connection.datastore.getStreamById(streamId);
};


// ------------- Raw calls to the API ----------- //

/**
 * get streams on the API
 * @private
 * @param {Pryv.Streams~options} opts
 * @param callback
 */
Streams.prototype._getData = function (opts, callback) {
  var url = opts ? '/streams?' + Utility.getQueryParametersString(opts) : '/streams';
  this.connection.request('GET', url, callback, null);
};

/**
 * Create a stream on the API with a jsonObject
 * @private
 * @param {Object} streamData an object array.. typically one that can be obtained with
 * stream.getData()
 * @param callback
 */
Streams.prototype._createWithData = function (streamData, callback) {
  var url = '/streams';
  this.connection.request('POST', url, function (err, resultData) {
    streamData.id = resultData.id;
    callback(err, resultData);
  }, streamData);
};

/**
 * Update a stream on the API with a jsonObject
 * @private
 * @param {Object} streamData an object array.. typically one that can be obtained with
 * stream.getData()
 * @param callback
 */
Streams.prototype._updateWithData = function (streamData, callback) {
  var url = '/streams/' + streamData.id;
  this.connection.request('PUT', url, callback, null);
};

// -- helper for get --- //

/**
 * @private
 * @param {Pryv.Streams~options} options
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


/**
 * Called once per streams
 * @callback Pryv.Streams~walkTreeEachStreams
 * @param {Pryv.Stream} stream
 */

/**
 * Called when walk is done
 * @callback Pryv.Streams~walkTreeDone
 */

/**
 * Walk the tree structure.. parents are always announced before childrens
 * @param {Pryv.Streams~options} options
 * @param {Pryv.Streams~walkTreeEachStreams} eachStream
 * @param {Pryv.Streams~walkTreeDone} done
 */
Streams.prototype.walkTree = function (options, eachStream, done) {
  this.get(options, function (error, result) {
    if (error) { return done('Stream.walkTree failed: ' + error); }
    Streams.Utils.walkObjectTree(result, eachStream);
    if (done) { done(null); }
  });
};


/**
 * Called when tree has been flatened
 * @callback Pryv.Streams~getFlatenedObjectsDone
 * @param {Streams[]} streams
 */

/**
 * Get the all the streams of the Tree in a list.. parents firsts
 * @param {Pryv.Streams~options} options
 * @param {Pryv.Streams~getFlatenedObjectsDone} done
 */
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
 * @param {Streams[]} arrayOfStreams
 */
Streams.prototype.getDisplayTree = function (arrayOfStreams) {
  return Streams.Utils._debugTree(arrayOfStreams);
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

module.exports = Streams;

/**
 * Called with the desired Streams as result.
 * @callback Pryv.Streams~getCallback
 * @param {Object} error - eventual error
 * @param {Pryv.Stream[]} result
 */

