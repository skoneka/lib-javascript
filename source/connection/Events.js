
var Utility = require('../utility/Utility.js'),
  _ = require('underscore'),
  Event = require('../Event');



var Events = module.exports = function (conn) {
  this.conn = conn;
};


Events.prototype.get = function (filter, deltaFilter, callback) {
  //TODO handle caching
  var result = [];
  this._get(filter, deltaFilter, function (error, eventList) {
    _.each(eventList, function (eventData) {
      result.push(new Event(this.conn, eventData));
    }.bind(this));
    callback(error, result);
  }.bind(this));
};

Events.prototype._get = function (filter, deltaFilter, callback, context) {
  var tParams = Utility.mergeAndClean(filter.settings, deltaFilter);
  var url = '/events?' + Utility.getQueryParametersString(tParams);
  this.conn.request('GET', url, callback, null, context);
};




/**
 * TODO code it right
 * @param eventsData Array of EventsData
 * @param context
 */
Events.prototype.batch = function (eventsData, callback, context) {
  if (!_.isArray(eventsData)) { eventsData = [eventsData]; }
  var url = '/events/batch';
  _.each(eventsData, function (event, index) {
    event.tempRefId = 'temp_ref_id_' + index;
  });
  this.conn.request('POST', url, function (err, result) {
    _.each(eventsData, function (event) {
      event.id = result[event.tempRefId].id;
    });
    callback(err, result);
  }, eventsData, context);
};

Events.prototype.update = function (event, callback, context) {
  var url = '/events/' + event.id;
  this.conn.request('PUT', url, callback, null, context);
};

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
};



