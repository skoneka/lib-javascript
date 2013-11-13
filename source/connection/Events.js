
var Utility = require('../utility/Utility.js'),
  _ = require('underscore'),
  Filter = require('../Filter'),
  Event = require('../Event');


/**
 * @class Pryv.Events
 *
 * Coverage of the API
 *  GET /events -- 100%
 *  POST /events -- only data (no object)
 *  POST /events/start -- 0%
 *  POST /events/stop -- 0%
 *  PUT /events/{event-id} -- 100%
 *  DELETE /events/{event-id} -- only data (no object)
 *  POST /events/batch -- only data (no object)
 *
 *  attached files manipulations are covered by Pryv.Event
 *
 *
 * @param {Pryv.Connection} connection
 * @constructor
 */
function Events(connection) {
  this.connection = connection;
}


/**
 * @param {Pryv.Filter} filter
 * @param {Pryv.Events~getCallback} doneCallback
 * @param {Pryv.Events~partialResultCallback} partialResultCallback
 */
Events.prototype.get = function (filter, doneCallback, partialResultCallback) {
  //TODO handle caching
  var result = [];
  this._get(filter, function (error, eventList) {
    _.each(eventList, function (eventData) {
      result.push(new Event(this.connection, eventData));
    }.bind(this));
    doneCallback(error, result);
    if (partialResultCallback) { partialResultCallback(result); }
  }.bind(this));
};

/**
 * @param {Pryv.Event} event
 * @param {Pryv.Connection~requestCallback} callback
 */
Events.prototype.update = function (event, callback) {
  this.updateWithIdAndData(event.id, event.getData(), callback);
};

/**
 * @param {Pryv.Event} event
 * @param {Pryv.Connection~requestCallback} callback
 */
Events.prototype.trash = function (event, callback) {
  this.trashWithId(event.id, callback);
};

/**
 * @param {String} eventId
 * @param {Pryv.Connection~requestCallback} callback
 */
Events.prototype.trashWithId = function (eventId, callback) {
  var url = '/events/' + eventId;
  this.connection.request('DELETE', url, callback, null);
};

/**
 * This is the preferred method to create an even.
 * The function return the newly created object.. It will be updated when posted on the API.
 * @param {Object} eventData -- minimum {streamId, type }
 * @param {Pryv.Events~eventCreatedOnTheAPI} callback
 * @return {Pryv.Event} event
 */
Events.prototype.createWithData = function (eventData, callback) {
  var event = new Event(this.connection, eventData);
  var url = '/events';
  this.connection.request('POST', url, function (err, result) {
    if (result) {
      _.extend(event, result);
    }
    callback(err, event);
  }, event.getData());
  return event;
};

/**
 * This is the preffered method to create events in batch
 * @param {Object[]} eventsData -- minimum {streamId, type }
 * @param {Pryv.Events~eventBatchCreatedOnTheAPI}
 * @param {function} [callBackWithEventsBeforeRequest] mostly for testing purposes
 * @return {Pryv.Event[]} events
 */
Events.prototype.batchWithData = function (eventsData, callback, callBackWithEventsBeforeRequest) {
  if (!_.isArray(eventsData)) { eventsData = [eventsData]; }

  var createdEvents = [];
  var eventMap = {};

  var url = '/events/batch';
  // use the serialId as a temporary Id for the batch
  _.each(eventsData, function (eventData) {
    var event =  new Event(this.connection, eventData);
    createdEvents.push(event);
    eventMap[event.serialId] = event;
    eventData.tempRefId = event.serialId;
  }.bind(this));

  if (callBackWithEventsBeforeRequest) { callBackWithEventsBeforeRequest(createdEvents); }

  this.connection.request('POST', url, function (err, result) {
    _.each(result, function (eventData, tempRefId) {
      _.extend(eventMap[tempRefId], eventData); // add the data to the event
    });
    callback(err, createdEvents);
  }, eventsData);

  return createdEvents;
};

// --- raw access to the API

/**
 * @param {Pryv.Filter} filter
 * @param {Pryv.Connection~requestCallback} callback
 * @private
 */
Events.prototype._get = function (filter, callback) {
  var tParams = filter;
  if (filter instanceof Filter) { tParams = filter.getData(true); }
  if (_.has(tParams, 'streams') && tParams.streams.length === 0) { // dead end filter..
    return callback(null, []);
  }
  var url = '/events?' + Utility.getQueryParametersString(tParams);
  this.connection.request('GET', url, callback, null);
};





Events.prototype.updateWithIdAndData = function (eventId, data, callback) {
  var url = '/events/' + eventId;
  this.connection.request('PUT', url, callback, data);
};


module.exports = Events;

/**
 * Called with the desired Events as result.
 * @callback Pryv.Events~getCallback
 * @param {Object} error - eventual error
 * @param {Pryv.Event[]} result
 */


/**
 * Called each time a "part" of the result is received
 * @callback Pryv.Events~partialResultCallback
 * @param {Pryv.Event[]} result
 */


/**
 * Called when an event is created on the API
 * @callback Pryv.Events~eventCreatedOnTheAPI
 * @param {Object} error - eventual error
 * @param {Pryv.Event} event
 */

/**
 * Called when batch create an array of events on the API
 * @callback Pryv.Events~eventBatchCreatedOnTheAPI
 * @param {Object} error - eventual error
 * @param {Pryv.Event[]} events
 */