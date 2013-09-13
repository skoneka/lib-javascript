
var _ = require('lodash'),
    Utility = require('../utility/Utility.js');

var Streams = module.exports = function (connection) {
  this.connection = connection;
};

Streams.prototype.get = function (callback, opts) {
  var url = '/streams?' + Utility.getQueryParametersString(opts);
  this.connection.request('GET', url, callback);
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
  this.connection.request('PUT', url, callback);
};
