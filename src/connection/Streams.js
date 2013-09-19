
var _ = require('underscore'),
    Utility = require('../utility/Utility.js');

var Streams = module.exports = function (connection) {
  this.connection = connection;
};

Streams.prototype.get = function (callback, opts, context) {
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
