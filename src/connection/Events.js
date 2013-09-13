
var Utility = require('../utility/Utility.js'),
    _ = require('lodash');

var Events = module.exports = function (conn) {
  this.conn = conn;
};

Events.prototype.get = function (filter, callback) {
  var url = '/events?' + Utility.getQueryParametersString(filter.settings);
  this.conn.request('GET', url, callback);
};

/**
 *
 * @param {Array} events
 */
Events.prototype.create = function (events, callback) {
  var url = '/events/batch';
  _.each(events, function (event, index) {
    event.tempRefId = 'temp_ref_id_' + index;
  });
  this.conn.request('POST', url, function (err, result) {
    _.each(events, function (event) {
      event.id = result[event.tempRefId].id;
    });
    callback(err, result);
  }, events);
};

Events.prototype.update = function (event, callback) {
  var url = '/events/' + event.id;
  this.conn.request('PUT', url, callback);
};

//TODO: rewrite once API for monitoring is sorted out
Events.prototype.monitor = function (filter, callback) {
  var that = this;
  var lastSynchedST = -1;

  this.conn.monitor(function (signal, payload) {
    switch (signal) {
    case 'connect':
      // set current serverTime as last update
      lastSynchedST = that.getServerTime();
      callback(signal, payload);
      break;
    case 'event' :
      that.events.get(filter, function (error, result) {
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
};
