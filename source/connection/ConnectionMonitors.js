var _ = require('underscore'),
  System = require('../system/System.js'),
  Monitor = require('../Monitor.js');

/**
 * @class ConnectionMonitors
 * @private
 *
 * @param {Connection} connection
 * @constructor
 */
function ConnectionMonitors(connection) {
  this.connection = connection;
  this._monitors = {};
  this.ioSocket = null;
}

/**
 * Start monitoring this Connection. Any change that occurs on the connection (add, delete, change)
 * will trigger an event. Changes to the filter will also trigger events if they have an impact on
 * the monitored data.
 * @param {Filter} filter - changes to this filter will be monitored.
 * @returns {Monitor}
 */
ConnectionMonitors.prototype.create = function (filter) {
  return new Monitor(this.connection, filter);
};



/**
 * TODO
 * @private
 */
ConnectionMonitors.prototype._stopMonitoring = function (/*callback*/) {

};

/**
 * Internal for Connection.Monitor
 * Maybe moved in Monitor by the way
 * @param callback
 * @private
 * @return {Object} XHR or Node http request
 */
ConnectionMonitors.prototype._startMonitoring = function (callback) {

  if (this.ioSocket) { return callback(null/*, ioSocket*/); }

  var settings = {
    host : this.connection.username + '.' + this.connection.settings.domain,
    port : this.connection.settings.port,
    ssl : this.connection.settings.ssl,
    path : this.connection.settings.extraPath + '/' + this.connection.username,
    namespace : '/' + this.connection.username,
    auth : this.connection.auth
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

module.exports = ConnectionMonitors;

