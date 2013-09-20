var Stream = require('./Stream');
var _ = require('underscore');

var Datastore = module.exports = function (connection) {
  this.connection = connection;
  this.streams = {};
  this.events = {};
};

Datastore.prototype.init = function (callback) {
  var self = this;
  this.connection.streams.getFlatenedObjects(function (error, result) {
    if (error) { return callback(error); }
    self.streams = {};
    _.each(result, function (stream) {
      self.streams[stream.id] = stream;
    });
    callback(error);
  });
};

/**
 *
 * @param streamId
 * @returns Stream or null if not found
 */
Datastore.prototype.getStreamById = function(streamId) {
  return this.streams[streamId];
};
