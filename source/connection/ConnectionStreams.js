var _ = require('underscore'),
    utility = require('../utility/utility.js'),
    Stream = require('../Stream.js');

/**
 * @class ConnectionStreams
 * @description
 * ##Coverage of the API
 *
 *  * GET /streams -- 100%
 *  * POST /streams -- only data (no object)
 *  * PUT /streams -- 0%
 *  * DELETE /streams/{stream-id} -- 0%
 *
 *
 *
 * @param {Connection} connection
 * @constructor
 */
function ConnectionStreams(connection) {
  this.connection = connection;
  this._streamsIndex = {};
}



/**
 * @typedef ConnectionStreamsOptions parameters than can be passed along a Stream request
 * @property {string} parentId  if parentId is null you will get all the "root" streams.
 * @property {string} [state] 'all' || null  - if null you get only "active" streams
 **/


/**
 * @param {ConnectionStreamsOptions} options
 * @param {ConnectionStreams~getCallback} callback - handles the response
 */
ConnectionStreams.prototype.get = function (options, callback) {
  if (this.connection.datastore) {
    var resultTree = [];
    if (options && _.has(options, 'parentId')) {
      resultTree = this.connection.datastore.getStreamById(options.parentId).children;
    } else {
      resultTree = this.connection.datastore.getStreams();
    }
    if (resultTree.length > 0) {
      callback(null, resultTree);
    } else {
      this._getObjects(options, callback);
    }
  } else {
    this._getObjects(options, callback);
  }
};



/**
 * @param {ConnectionStreamsOptions} options
 * @param {ConnectionStreams~getCallback} callback - handles the response
 */
ConnectionStreams.prototype.updateProperties = function (stream, properties, options, callback) {
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
 * @throws {Error} Connection.fetchStructure must have been called before.
 */
ConnectionStreams.prototype.getById = function (streamId) {
  if (! this.connection.datastore) {
    throw new Error('Call connection.fetchStructure before, to get automatic stream mapping');
  }
  return this.connection.datastore.getStreamById(streamId);
};


// ------------- Raw calls to the API ----------- //

/**
 * get streams on the API
 * @private
 * @param {ConnectionStreams~options} opts
 * @param callback
 */
ConnectionStreams.prototype._getData = function (opts, callback) {
  var url = opts ? '/streams?' + utility.getQueryParametersString(opts) : '/streams';
  this.connection.request('GET', url, callback, null);
};

ConnectionStreams.prototype.create = function (streamData, callback) {
  streamData = _.pick(streamData, 'id', 'name', 'parentId', 'singleActivity',
    'clientData', 'trashed');
  this._createWithData(streamData, callback);
};
/**
 * Create a stream on the API with a jsonObject
 * @private
 * @param {Object} streamData an object array.. typically one that can be obtained with
 * stream.getData()
 * @param callback
 */
ConnectionStreams.prototype._createWithData = function (streamData, callback) {
  var url = '/streams';
  this.connection.request('POST', url, function (err, resultData) {
    if (!err && resultData) {
      streamData.id = resultData.stream.id;
      var stream = new Stream(this.connection, resultData.stream);
      if (this.connection.datastore) {
        this.connection.datastore.indexStream(stream);
      }
    }
    if (_.isFunction(callback)) {
      return callback(err, resultData.stream);
    }
  }.bind(this), streamData);
};

/**
 * Update a stream on the API with a jsonObject
 * @private
 * @param {Object} streamData an object array.. typically one that can be obtained with
 * stream.getData()
 * @param callback
 */
ConnectionStreams.prototype._updateWithData = function (streamData, callback) {
  var url = '/streams/' + streamData.id;
  this.connection.request('PUT', url, callback, streamData);
};

// -- helper for get --- //

/**
 * @private
 * @param {ConnectionStreams~options} options
 */
ConnectionStreams.prototype._getObjects = function (options, callback) {
  options = options || {};
  options.parentId = options.parentId || null;
  var streamsIndex = {};
  var resultTree = [];
  this._getData(options, function (error, result) {
    if (error) { return callback('Stream.get failed: ' + error); }
    var treeData = result.streams || result.stream;
    ConnectionStreams.Utils.walkDataTree(treeData, function (streamData) {
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
 * @callback ConnectionStreams~walkTreeEachStreams
 * @param {Stream} stream
 */

/**
 * Called when walk is done
 * @callback ConnectionStreams~walkTreeDone
 */

/**
 * Walk the tree structure.. parents are always announced before childrens
 * @param {ConnectionStreams~options} options
 * @param {ConnectionStreams~walkTreeEachStreams} eachStream
 * @param {ConnectionStreams~walkTreeDone} done
 */
ConnectionStreams.prototype.walkTree = function (options, eachStream, done) {
  this.get(options, function (error, result) {
    if (error) { return done('Stream.walkTree failed: ' + error); }
    ConnectionStreams.Utils.walkObjectTree(result, eachStream);
    if (done) { done(null); }
  });
};


/**
 * Called when tree has been flatened
 * @callback ConnectionStreams~getFlatenedObjectsDone
 * @param {ConnectionStreams[]} streams
 */

/**
 * Get the all the streams of the Tree in a list.. parents firsts
 * @param {ConnectionStreams~options} options
 * @param {ConnectionStreams~getFlatenedObjectsDone} done
 */
ConnectionStreams.prototype.getFlatenedObjects = function (options, callback) {
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
 * @param {ConnectionStreams[]} arrayOfStreams
 */
ConnectionStreams.prototype.getDisplayTree = function (arrayOfStreams) {
  return ConnectionStreams.Utils._debugTree(arrayOfStreams);
};


// TODO Validate that it's the good place for them .. Could have been in Stream or utility
ConnectionStreams.Utils = {


  /**
   * Walk thru a streamArray of objects
   * @param streamTree
   * @param callback function(stream)
   */
  walkObjectTree : function (streamArray, eachStream) {
    _.each(streamArray, function (stream) {
      eachStream(stream);
      ConnectionStreams.Utils.walkObjectTree(stream.children, eachStream);
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
        children : ConnectionStreams.Utils._debugTree(stream.children)
      });
    });
    return result;
  }

};

module.exports = ConnectionStreams;

/**
 * Called with the desired streams as result.
 * @callback ConnectionStreams~getCallback
 * @param {Object} error - eventual error
 * @param {Stream[]} result
 */

