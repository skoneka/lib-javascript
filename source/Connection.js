var _ = require('underscore'),
  System = require('./system/System.js'),
  ConnectionEvents = require('./connection/Events.js'),
  ConnectionStreams = require('./connection/Streams.js'),
  Datastore = require('./Datastore.js'),
  Monitor = require('./connection/Monitor.js');

/**
 * Create an instance of Connection to Pryv API.
 * The connection will be opened on
 * http[s]://<username>.<domain>:<port>/<extrapath>?auth=<auth>
 *
 * @constructor
 * @this {Connection}
 * @param {string} username
 * @param {string} auth the authorization token for this username
 * @param {Object} [settings]
 * @param {number} [settings.port = 443]
 * @param {string} [settings.domain = 'pryv.io'] change the domain. use "settings.staging = true" to
 * activate 'pryv.in' staging domain.
 * @param {boolean} [settings.ssl = true] Use ssl (https) or no
 * @param {string} [settings.extraPath = ''] append to the connections
 */
var Connection = function (username, auth, settings) {
  this._serialId = Connection._serialCounter++;

  this.username = username;
  this.auth = auth;

  this.settings = _.extend({
    port: 443,
    ssl: true,
    domain: 'pryv.io',
    extraPath: ''
  }, settings);

  if (settings && settings.staging) { this.settings.domain = 'pryv.in'; }

  this.serverInfos = {
    // nowLocalTime - nowServerTime
    deltaTime: null,
    apiVersion: null,
    lastSeenLT: null
  };

  this._accessInfo = null;

  this._streamSerialCounter = 0;
  this._eventSerialCounter = 0;

  this.events = new ConnectionEvents(this);
  this.streams = new ConnectionStreams(this);

  this.datastore = null;

  this._ioSocket = null;
  this._monitors = {};
};

Connection._serialCounter = 0;


/**
 * TODO create an open() .. like access_info and add this as a setting
 * Use localStorage for caching.
 * The Library will activate Structure Monitoring and
 * @param callback
 * @returns {*}
 */
Connection.prototype.useLocalStorage = function (callback) {
  if (this.datastore) { return this.datastore.init(callback); }
  this.datastore = new Datastore(this);
  this.accessInfo(function (error) {
    if (error) { return callback(error); }
    this.datastore.init(callback);
  }.bind(this));
  return this;
};

Connection.prototype.accessInfo = function (callback) {
  if (this._accessInfo) { return this._accessInfo; }
  var url = '/access-info';
  this.request('GET', url, function (error, result) {
    if (! error) {
      this._accessInfo = result;
    }
    return callback(error, result);
  }.bind(this));
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
  if (typeof localTime === 'undefined') { localTime = new Date().getTime(); }
  return (localTime / 1000) - this.serverInfos.deltaTime;
};


// ------------- monitor this connection --------//

Connection.prototype.monitor = function (filter) {
  return new Monitor(this, filter);
};

// ------------- start / stop Monitoring is called by Monitor constructor / destructor -----//

/**
 * TODO
 * @private
 */
Connection.prototype._stopMonitoring = function (/*callback*/) {

};

/**
 *
 * @param callback
 * @returns {*}
 * @private
 */
Connection.prototype._startMonitoring = function (callback) {

  if (this.ioSocket) { return callback(null/*, ioSocket*/); }



  var settings = {
    host : this.username + '.' + this.settings.domain,
    port : this.settings.port,
    ssl : this.settings.ssl,
    path : this.settings.extraPath + '/' + this.username,
    namespace : '/' + this.username,
    auth : this.auth
  };

  this.ioSocket = System.ioConnect(settings);

  this.ioSocket.on('connect', function () {
    _.each(this._monitors, function (monitor) { monitor._onIoConnect(); });
  }.bind(this));
  this.ioSocket.on('error', function (error) {
    _.each(this._monitors, function (monitor) { monitor._onIoError(error); });
  }.bind(this));
  this.ioSocket.on('eventsChanged', function () {
    _.each(this._monitors, function (monitor) { monitor._onIoEventsChanged(); });
  }.bind(this));
  this.ioSocket.on('streamsChanged', function () {
    _.each(this._monitors, function (monitor) { monitor._onIoStreamsChanged(); });
  }.bind(this));
  callback(null);
};

Connection.prototype.request = function (method, path, callback, jsonData) {
  if (! callback || ! _.isFunction(callback)) {
    throw new Error('request\'s callback must be a function');
  }
  var headers =  { 'authorization': this.auth };

  var payload = null;
  if (jsonData) {
    payload = JSON.stringify(jsonData);
    headers['Content-Type'] = 'application/json; charset=utf-8';
  }

  System.request({
    method : method,
    host : this.username + '.' + this.settings.domain,
    port : this.settings.port,
    ssl : this.settings.ssl,
    path : this.settings.extraPath + path,
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
    callback(null, result);
  }

  function onError(error /*, requestInfo*/) {
    callback(error, null);
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

//TODO rename in displayID
Object.defineProperty(Connection.prototype, 'displayId', {
  get: function () {
    if (! this._accessInfo) {
      throw new Error('connection must have been initialized to use displayId. ' +
        ' You can call accessInfo() for this');
    }
    var id = this.username + ':' + this._accessInfo.name;
    return id;
  },
  set: function () { throw new Error('Connection.displayId property is read only'); }
});


Object.defineProperty(Connection.prototype, 'serialId', {
  get: function () { return 'C' + this._serialId; }
});



module.exports = Connection;