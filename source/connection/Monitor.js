var _ = require('underscore');
var SignalEmitter = require('../Utility/SignalEmitter.js');
var MSGs = require('../Messages.js').Monitor;

/**
 *
 * @type {Function}
 * @constructor
 */
var Monitor = module.exports = function (connection, filter) {
  SignalEmitter.extend(this, MSGs);
  this.connection = connection;
  this.id = 'M' + Monitor.serial++;

  this.filter = filter;
  this.filter.addOnChangeListener(this._onFilterChange);

  this._events = null;
};

Monitor.serial = 0;



// ----------- prototype ------------//

Monitor.prototype.start = function (done) {
  done = done || function () {};

  this.connection.events.get(this.filter, null, function (error, events) {
    if (error) {
      this._fireEvent(MSGs.ON_ERROR, error);
    }
    this._fireEvent(MSGs.ON_LOAD, events);
  }.bind(this));

  this.connection._ioSocketMonitors[this.id] = this;
  this.connection._startMonitoring(done);

};



Monitor.prototype.onConnect = function () { };
Monitor.prototype.onError = function (/*error*/) { };
Monitor.prototype.onEventsChanged = function () { };
Monitor.prototype.onStreamsChanged = function () { };


Monitor.prototype.destroy = function () {
  delete this.connection._ioSocketMonitors[this.id];
  if (_.keys(this.connection._ioSocketMonitors).length === 0) {
    this.connection._stopMonitoring();
  }
};

/**
//TODO: rewrite once API for monitoring is sorted out
Events.prototype.monitor = function (filter, callback) {
  var that = this;
  var lastSynchedST = -1;

  this.conn.monitor(filter, function (signal, payload) {
    switch (signal) {
      case 'connect':
        // set current serverTime as last update
        lastSynchedST = that.conn.getServerTime();
        callback(signal, payload);
        break;
      case 'event' :
        that.conn.events.get(filter, function (error, result) {
          _.each(result, function (e) {
            if (e.modified > lastSynchedST)  {
              lastSynchedST = e.modified;
            }
          });
          callback('events', result);
        }, { modifiedSince : lastSynchedST});
        break;
      case 'error' :
        callback(signal, payload);
        break;
    }

  });
};   **/




/**
 * TODO:
 * - expose events for data changes
 * - eventually expose getter/setter to update filter
 */