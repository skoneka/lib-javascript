
var Utility = require('../utility/Utility.js'),
  _ = require('underscore'),
  Filter = require('../Filter'),
  Event = require('../Event');



var Events = module.exports = function (conn) {
  this.conn = conn;
};


/**
 *
 * @param filter Pryv.Filter object or a properties map
 * @param doneCallback
 * @param partialResultCallback
 */
Events.prototype.get = function (filter, doneCallback, partialResultCallback) {
  //TODO handle caching
  var result = [];
  this._get(filter, function (error, eventList) {
    _.each(eventList, function (eventData) {
      result.push(new Event(this.conn, eventData));
    }.bind(this));
    doneCallback(error, result);
    if (partialResultCallback) { partialResultCallback(error, result); }
  }.bind(this));
};

Events.prototype._get = function (filter, callback) {
  var tParams = filter;
  if (filter instanceof Filter) { tParams = filter.getData(true); }
  if (_.has(tParams, 'streams') && tParams.streams.length === 0) { // dead end filter..
    return callback(null, []);
  }
  var url = '/events?' + Utility.getQueryParametersString(tParams);
  this.conn.request('GET', url, callback, null);
};

/**
 * @param eventData minimum {streamId, type }
 * @return event
 */
Events.prototype.create = function (eventData, callback) {
  var event = new Event(this.conn, eventData);
  var url = '/events';
  this.conn.request('POST', url, function (err, result) {
    if (result) {
      _.extend(event, result);
    }
    callback(err, result);
  }, event.getData());
  return event;
};

Events.prototype.trash = function (event, callback) {
  this.deleteWithId(event.id, callback);
};

Events.prototype.trashWithId = function (eventId, callback) {
  var url = '/events/' + eventId;
  this.conn.request('DELETE', url, callback, null);
};



/**
 * TODO code it right
 * @param eventsData Array of EventsData
 */
Events.prototype.batch = function (eventsData, callback) {
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
  }, eventsData);
};

Events.prototype.update = function (event, callback) {
  this.updateWithIdAndData(event.id, event.getData(), callback);
};

Events.prototype.updateWithIdAndData = function (eventId, data, callback) {
  var url = '/events/' + eventId;
  this.conn.request('PUT', url, callback, data);
};



