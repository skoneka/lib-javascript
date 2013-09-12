
var Utility = require('../../utility/Utility.js');

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
Events.prototype.create = function (events) {

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
