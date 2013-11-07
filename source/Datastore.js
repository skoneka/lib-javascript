var _ = require('underscore');

var Datastore = module.exports = function (connection) {
  this.connection = connection;
  this.streamsIndex = {}; // streams are linked to their object representation
  this.rootStreams = [];

};

Datastore.prototype.init = function (callback) {
  this.connection.streams._getObjects({state: 'all'}, function (error, result) {
    if (error) { return callback('Datastore faild to init - '  + error); }
    if (result) {
      this._rebuildStreamIndex(result); // maybe done transparently
    }
    callback(null, result);
  }.bind(this));

  // activate monitoring

};

Datastore.prototype._rebuildStreamIndex = function (streamArray) {
  this.streamsIndex = {};
  this.rootStreams = [];
  this._indexStreamArray(streamArray);
};

Datastore.prototype._indexStreamArray = function (streamArray) {
  _.each(streamArray, function (stream) {
    this.streamsIndex[stream.id] = stream;
    if (! stream._parent) { this.rootStreams.push(stream); }
    this._indexStreamArray(stream._children);
    delete stream._children; // cleanup when in datastore mode
    delete stream._parent;
  }.bind(this));
};


/**
 *
 * @param streamId
 * @returns Stream or null if not found
 */
Datastore.prototype.getStreams = function () {
  return this.rootStreams;
};


/**
 *
 * @param streamId
 * @param test (do no throw error if Stream is not found
 * @returns Stream or null if not found
 */
Datastore.prototype.getStreamById = function (streamId, test) {
  var result = this.streamsIndex[streamId];
  if (! test && ! result) {
    throw new Error('Datastore.getStreamById cannot find stream with id: ' + streamId);
  }
  return result;
};

