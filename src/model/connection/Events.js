
var Utility = require('../../utility/Utility.js');


var Events = function (conn) {
  this.conn = conn;
};
Events.prototype = {
  conn: null,
  get : function (filter, callback, deltaFilter) {
    var tParams = Utility.MergeAndClean(this.settings, deltaFilter);
    var url = '/events?' + Utility.URLParametersFromJSON(tParams);
    this.conn.request('GET', url, function (error, result) {
      callback(error, result);
    });
  },

  /**
   *
   * @param event Array of Events
   */
  post : function (events) {

  },

  monitor : function (filter, callback) {
    var that = this;
    var lastSynchedST = -1;

    this.ioMonitor(function (signal, payload) {
      switch (signal) {
      case 'connect':
        // set current serverTime as last update
        lastSynchedST = that.timeSystemToServer();
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
  }
};


module.exports = Events;