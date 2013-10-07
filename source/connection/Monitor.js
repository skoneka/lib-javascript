var _ = require('underscore');

/**
 *
 * @type {Function}
 * @constructor
 */
var Monitor = module.exports = function (connection, filter) {
  this.connection = connection;
  this.id = 'M' + Monitor.serial++;

  this.filter = filter;
  this.filter.addOnChangeListener(this.onFilterChange);

  this.connection._ioSocketMonitors[this.id] = this;
  this.connection._startMonitoring();
};

Monitor.prototype.onFilterChange = function () {
  console.log('onFilterChange');
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

Monitor.serial = 0;

/**
 * TODO:
 * - expose events for data changes
 * - eventually expose getter/setter to update filter
 */