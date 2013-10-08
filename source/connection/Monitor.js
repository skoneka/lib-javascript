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

  this.lastSynchedST = -1000000000000;
  this.refreshEvents();

  this.connection._ioSocketMonitors[this.id] = this;
  this.connection._startMonitoring(done);

};



Monitor.prototype.onConnect = function () {
  console.log('Monitor onConnect');
};
Monitor.prototype.onError = function (error) {
  console.log('Monitor onError' + error);
};
Monitor.prototype.onEventsChanged = function () {
  this.refreshEvents();

};
Monitor.prototype.onStreamsChanged = function () { };


Monitor.prototype.destroy = function () {
  delete this.connection._ioSocketMonitors[this.id];
  if (_.keys(this.connection._ioSocketMonitors).length === 0) {
    this.connection._stopMonitoring();
  }
};


Monitor.prototype.refreshEvents = function () {

  var options = { modifiedSince : this.lastSynchedST};
  this.lastSynchedST = this.connection.getServerTime();

  this.connection.events.get(this.filter, options,
    function (error, events) {
    if (error) {
      this._fireEvent(MSGs.ON_ERROR, error);
    }
    this._fireEvent(MSGs.ON_LOAD, events);
  }.bind(this));

};




/**
 * TODO:
 * - expose events for data changes
 * - eventually expose getter/setter to update filter
 */