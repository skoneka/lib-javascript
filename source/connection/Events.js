
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
 * @param eventData minimum {streamId, type }
 * @param context
 * @return event
 */
Events.prototype.create = function (eventData, callback, context) {
  var event = new Event(this.conn, eventData);
  var url = '/events';
  this.conn.request('POST', url, function (err, result) {
    if (result) {
      _.extend(event, result);
    }
    callback(err, result);
  }, event.getData(), context);
  return event;
};

Events.prototype.trash = function (event, callback, context) {
  this.deleteWithId(event.id, callback, context);
};

Events.prototype.trashWithId = function (eventId, callback, context) {
  var url = '/events/' + eventId;
  this.conn.request('DELETE', url, callback, null, context);
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



