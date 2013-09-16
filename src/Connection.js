/**
 * TODO
 * @type {*}
 */

var _ = require('lodash'),
    System = require('./system/System.js'),
    ConnectionEvents = require('./connection/Events.js'),
    ConnectionStreams = require('./connection/Streams.js');

var Connection = module.exports = function (username, auth, settings) {
  // Constructor new-Agnostic
  var self = this instanceof Connection ? this : Object.create(Connection.prototype);

  self.username = username;
  self.auth = auth;


  self.settings = _.extend({
    port: 443,
    ssl: true,
    domain: 'pryv.io'
  }, settings);

  self.serverInfos = {
    // currentTime - serverTime
    deltaTime: null,
    apiVersion: null,
    lastSeenLT: null
  };

  self.events = new ConnectionEvents(self);
  self.streams = new ConnectionStreams(self);
  return self;
};

Connection.prototype.getLocalTime = function (serverTime) {
  return (serverTime + this.serverInfos.deltaTime) * 1000;
};

Connection.prototype.getServerTime = function (localTime) {
  localTime = localTime || new Date().getTime() / 1000;
  return localTime - this.serverInfos.deltaTime;
};

Connection.prototype.monitor = function (filter, callback) {
  var settings = {
    host : this.username + '.' + this.settings.domain,
    port : this.settings.port,
    ssl : this.settings.ssl,
    path : '/' + this.username,
    namespace : '/' + this.username,
    auth : this.auth
  };

  var ioSocket = System.ioConnect(settings);

  //TODO: rethink how we want to expose this to clients
  ioSocket.on('connect', function () {
    callback('connect');
  });
  ioSocket.on('connect', function (error) {
    callback('error', error);
  });
  ioSocket.on('eventsChanged', function () {
    callback('event');
  });
};

Connection.prototype.request = function (method, path, callback, jsonData) {
  var headers =  { 'authorization': this.auth };

  var payload = null;
  if (jsonData) {
    payload = JSON.stringify(jsonData);
    headers['Content-Type'] = 'application/json; charset=utf-8';
    headers['Content-Length'] = payload.length;
  }

  System.request({
    method : method,
    host : this.username + '.' + this.settings.domain,
    port : this.settings.port,
    ssl : this.settings.ssl,
    path : path,
    headers : headers,
    payload : payload,
    //TODO: decide what callback convention to use (Node or jQuery)
    success : onSuccess.bind(this),
    error : onError.bind(this)
  });

  /**
   * @this {Connection}
   */
  function onSuccess(result, requestInfos) {
    this.serverInfos.lastSeenLT = (new Date()).getTime();
    this.serverInfos.apiVersion = requestInfos.headers['api-version'] ||
      this.serverInfos.apiVersion;
    if (_.has(requestInfos.headers, 'server-time')) {
      this.serverInfos.deltaTime = ((new Date()).getTime() / 1000) -
        requestInfos.headers['server-time'];
    }
    callback(null, result);
  }

  function onError(error /*, requestInfo*/) {
    callback(error, null);
  }

};
