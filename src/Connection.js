/**
 * TODO
 * @type {*}
 */

var _ = require('underscore'),
  System = require('./system/System.js'),
  ConnectionEvents = require('./connection/Events.js'),
  ConnectionStreams = require('./connection/Streams.js'),
  Datastore = require('./Datastore.js');

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
    // nowLocalTime - nowServerTime
    deltaTime: null,
    apiVersion: null,
    lastSeenLT: null
  };

  self._accessInfo = null;

  self.events = new ConnectionEvents(self);
  self.streams = new ConnectionStreams(self);

  self.datastore = null;
  return self;
};

/**
 * Use localStorage for caching.
 * The Library will activate Structure Monitoring and
 * @param callback
 * @returns {*}
 */
Connection.prototype.useLocalStorage = function (callback) {
  var self = this;
  if (self.datastore) { return self.datastore.init(callback); }
  self.datastore = new Datastore(self);
  this.accessInfo(function (error) {
    if (error) { return callback(error); }
    self.datastore.init(callback);
  });
};


Connection.prototype.accessInfo = function (callback) {
  if (this._accessInfo) { return this._accessInfo; }
  var self = this;
  var url = '/access-info';
  this.request('GET', url, function (error, result) {
    if (! error) {
      self._accessInfo = result;
    }
    return callback(error, result);
  });
};

/**
 * Translate this timestamp (server dimension) to local system dimension
 * This could have been named to "translate2LocalTime"
 * @param serverTime timestamp  (server dimension)
 * @returns {number} timestamp (local dimension)
 */
Connection.prototype.getLocalTime = function (serverTime) {
  return (serverTime + this.serverInfos.deltaTime) * 1000;
};

/**
 * Translate this timestamp (local system dimension) to server dimension
 * This could have been named to "translate2ServerTime"
 * @param localTime timestamp  (local dimension)
 * @returns {number} timestamp (server dimension)
 */
Connection.prototype.getServerTime = function (localTime) {
  localTime = localTime || new Date().getTime();
  return (localTime / 1000) - this.serverInfos.deltaTime;
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

Connection.prototype.request = function (method, path, callback, jsonData, context) {
  var headers =  { 'authorization': this.auth };
  context = context ? context : this;
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
      this.serverInfos.deltaTime = (this.serverInfos.lastSeenLT / 1000) -
        requestInfos.headers['server-time'];
    }
    callback.call(context, null, result);
  }

  function onError(error /*, requestInfo*/) {
    callback.call(context, error, null);
  }

};


Object.defineProperty(Connection.prototype, 'id', {
  get: function () {
    var id = this.settings.ssl ? 'https://' : 'http://';
    id += this.username + '.' + this.settings.domain + ':' +
      this.settings.port + '/?auth=' + this.auth;
    return id;
  },
  set: function () { throw new Error('ConnectionNode.id property is read only'); }
});

Object.defineProperty(Connection.prototype, 'shortId', {
  get: function () {
    if (! this._accessInfo) {
      throw new Error('connection must have been initialized to use shortId. ' +
        ' You can call accessInfo() for this');
    }
    var id = this.username + ':' + this._accessInfo.name;
    return id;
  },
  set: function () { throw new Error('Connection.shortId property is read only'); }
});
