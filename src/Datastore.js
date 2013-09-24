var Streams = require('./connection/Streams.js');

var Datastore = module.exports = function (connection) {
  this.connection = connection;
  this.streamsIndex = {}; // streams are linked to their object representation
  this.streams = {};  // pure JSONObject received by the API
  this.events = {};
};

Datastore.prototype.init = function (callback) {
  var self = this;
  this.connection.streams._get(function (error, result) {
    if (result) {
      self.streams = result;
      self._rebuildStreamIndex(); // maybe done transparently
    }
    callback(error);
  }, {state: 'all'});

  // activate monitoring

};

Datastore.prototype._rebuildStreamIndex = function () {
  var self = this;
  this.streamsIndex = {};

  this.connection.streams.Utils.walkDataTree(this.streams, function (stream) {
    self.streamsIndex[stream.id] = stream;
  }, true);
};


// TODO move this to connection
/**
 *
 * @param streamId
 * @returns Stream or null if not found
 */
Datastore.prototype.getStreamById = function (streamId) {
  return this.streamsIndex[streamId];
};
