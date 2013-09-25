var Datastore = module.exports = function (connection) {
  this.connection = connection;
  this.streamsIndex = {}; // streams are linked to their object representation
  this.streams = null;  // object streams as if connection.streams._getObjects({state: 'all'})
  this.events = {};
};

Datastore.prototype.init = function (callback) {
  var self = this;
  this.connection.streams._getObjects({state: 'all'}, function (error, result) {
    if (result) {
      self.streams = result;
      self._rebuildStreamIndex(); // maybe done transparently
    }
    callback(error);
  });

  // activate monitoring

};

Datastore.prototype._rebuildStreamIndex = function () {
  var self = this;
  this.streamsIndex = {};

  this.connection.streams.Utils.walkDataTree(this.streams, function (stream) {
    self.streamsIndex[stream.id] = stream;
  }, true);
};


/**
 *
 * @param streamId
 * @returns Stream or null if not found
 */
Datastore.prototype.getStreams = function (streamId) {
  return this.streamsIndex[streamId];
};


/**
 *
 * @param streamId
 * @returns Stream or null if not found
 */
Datastore.prototype.getStreamById = function (streamId) {
  return this.streamsIndex[streamId];
};
