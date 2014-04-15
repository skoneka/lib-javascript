var utility = require('../utility/utility.js'),
  _ = require('underscore'),
  Filter = require('../Filter'),
  Event = require('../Event'),
  CC = require('./ConnectionConstants.js');

/**
 * @class ConnectionEvents
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
 *  attached files manipulations are covered by Event
 *
 *
 * @param {Connection} connection
 * @constructor
 */
function ConnectionEvents(connection) {
  this.connection = connection;
}


/**
 * @example
 * // get events from the Diary stream
 * conn.events.get({streamId : 'diary'},
 *  function(events) {
 *    console.log('got ' + events.length + ' events)
 *  }
 * );
 * @param {FilterLike} filter
 * @param {ConnectionEvents~getCallback} doneCallback
 * @param {ConnectionEvents~partialResultCallback} partialResultCallback
 */
ConnectionEvents.prototype.get = function (filter, doneCallback, partialResultCallback) {
  //TODO handle caching
  var result = [];
  this._get(filter, function (error, res) {
    var eventList = res.events || res.event;
    _.each(eventList, function (eventData) {
      result.push(new Event(this.connection, eventData));
    }.bind(this));
    doneCallback(error, result);
    if (partialResultCallback) { partialResultCallback(result); }
  }.bind(this));
};

/**
 * @param {Event} event
 * @param {Connection~requestCallback} callback
 */
ConnectionEvents.prototype.update = function (event, callback) {
  this._updateWithIdAndData(event.id, event.getData(), callback);
};

/**
 * @param {Event | eventId} event
 * @param {Connection~requestCallback} callback
 */
ConnectionEvents.prototype.trash = function (event, callback) {
  this.trashWithId(event.id, callback);
};

/**
 * @param {String} eventId
 * @param {Connection~requestCallback} callback
 */
ConnectionEvents.prototype.trashWithId = function (eventId, callback) {
  var url = '/events/' + eventId;
  this.connection.request('DELETE', url, callback, null);
};

/**
 * This is the preferred method to create an event, or to create it on the API.
 * The function return the newly created object.. It will be updated when posted on the API.
 * @param {NewEventLike} event -- minimum {streamId, type } -- if typeof Event, must belong to
 * the same connection and not exists on the API.
 * @param {ConnectionEvents~eventCreatedOnTheAPI} callback
 * @return {Event} event
 */
ConnectionEvents.prototype.create = function (newEventlike, callback) {
  var event = null;
  if (newEventlike instanceof Event) {
    if (newEventlike.connection !== this.connection) {
      return callback(new Error('event.connection does not match current connection'));
    }
    if (newEventlike.id) {
      return callback(new Error('cannot create an event already existing on the API'));
    }
    event = newEventlike;
  } else {
    event = new Event(this.connection, newEventlike);
  }

  var url = '/events';
  this.connection.request('POST', url, function (err, result, resultInfo) {
    if (! err && resultInfo.code !== 201) {
      err = {id : CC.Errors.INVALID_RESULT_CODE};
    }
    /**
     * Change will happend with offline caching...
     *
     * An error may hapend 400.. or other if app is behind an non-opened gateway. Thus making
     * difficult to detect if the error is a real bad request.
     * The first step would be to consider only bad request if the response can be identified
     * as coming from a valid api-server. If not, we should cache the event for later synch
     * then remove the error and send the cached version of the event.
     *
     */
    // TODO if err === API_UNREACHABLE then save event in cache
    if (result && ! err) {
      _.extend(event, result.event);
    }
    if (_.isFunction(callback)) {

      callback(err, err ? null : event);
    }
  }, event.getData());
  return event;
};
/**
 * @param {NewEventLike} event -- minimum {streamId, type } -- if typeof Event, must belong to
 * the same connection and not exists on the API.
 * @param {ConnectionEvents~eventCreatedOnTheAPI} callback
 * @param {FormData} the formData to post for fileUpload. On node.js
 * refers to pryv.utility.forgeFormData
 * @return {Event} event
 */
ConnectionEvents.prototype.createWithAttachment =
  function (newEventLike, formData, callback, progressCallback) {
  var event = null;
  if (newEventLike instanceof Event) {
    if (newEventLike.connection !== this.connection) {
      return callback(new Error('event.connection does not match current connection'));
    }
    if (newEventLike.id) {
      return callback(new Error('cannot create an event already existing on the API'));
    }
    event = newEventLike;
  } else {
    event = new Event(this.connection, newEventLike);
  }
  formData.append('event', JSON.stringify(event.getData()));
  var url = '/events';
  this.connection.request('POST', url, function (err, result) {
    if (result) {
      _.extend(event, result.event);
    }
    callback(err, event);
  }, formData, true, progressCallback);
};
ConnectionEvents.prototype.addAttachment = function (eventId, file, callback, progressCallback) {
  var url = '/events/' + eventId;
  this.connection.request('POST', url, callback, file, true, progressCallback);
};
ConnectionEvents.prototype.removeAttachment = function (eventId, fileName, callback) {
  var url = '/events/' + eventId + '/' + fileName;
  this.connection.request('DELETE', url, callback);
};
/**
 * //TODO rename to batch
 * //TODO make it NewEventLike compatible
 * //TODO once it support an array of mixed values Event and EventLike, the, no need for
 *  callBackWithEventsBeforeRequest at it will. A dev who want Event object just have to create
 *  them before
 * This is the prefered method to create events in batch
 * @param {Object[]} eventsData -- minimum {streamId, type }
 * @param {ConnectionEvents~eventBatchCreatedOnTheAPI}
 * @param {function} [callBackWithEventsBeforeRequest] mostly for testing purposes
 * @return {Event[]} events
 */
ConnectionEvents.prototype.batchWithData =
  function (eventsData, callback, callBackWithEventsBeforeRequest) {
  if (!_.isArray(eventsData)) { eventsData = [eventsData]; }

  var createdEvents = [];
  var eventMap = {};

  var url = '/';
  // use the serialId as a temporary Id for the batch
  _.each(eventsData, function (eventData, i) {
    var event =  new Event(this.connection, eventData);
    createdEvents.push(event);
    eventMap[i] = event;
  }.bind(this));

  if (callBackWithEventsBeforeRequest) {
    callBackWithEventsBeforeRequest(createdEvents);
  }

  var mapBeforePush = function (evs) {
    return _.map(evs, function (e) {
      return {
        method: 'events.create',
        params: e
      };
    });
  };

  this.connection.request('POST', url, function (err, result) {
    _.each(result.results, function (eventData, i) {
      _.extend(eventMap[i], eventData.event); // add the data to the event
    });
    callback(err, createdEvents);
  }, mapBeforePush(eventsData));

  return createdEvents;
};

// --- raw access to the API

/**
 * TODO anonymise by renaming to function _get(..
 * @param {FilterLike} filter
 * @param {Connection~requestCallback} callback
 * @private
 */
ConnectionEvents.prototype._get = function (filter, callback) {
  var tParams = filter;
  if (filter instanceof Filter) { tParams = filter.getData(true); }
  if (_.has(tParams, 'streams') && tParams.streams.length === 0) { // dead end filter..
    return callback(null, []);
  }
  var url = '/events?' + utility.getQueryParametersString(tParams);
  this.connection.request('GET', url, callback, null);
};


/**
 * TODO anonymise by renaming to function _xx(..
 * @param {String} eventId
 * @param {Object} data
 * @param  {Connection~requestCallback} callback
 * @private
 */
ConnectionEvents.prototype._updateWithIdAndData = function (eventId, data, callback) {
  var url = '/events/' + eventId;
  this.connection.request('PUT', url, callback, data);
};


module.exports = ConnectionEvents;

/**
 * Called with the desired Events as result.
 * @callback ConnectionEvents~getCallback
 * @param {Object} error - eventual error
 * @param {Event[]} result
 */


/**
 * Called each time a "part" of the result is received
 * @callback ConnectionEvents~partialResultCallback
 * @param {Event[]} result
 */


/**
 * Called when an event is created on the API
 * @callback ConnectionEvents~eventCreatedOnTheAPI
 * @param {Object} error - eventual error
 * @param {Event} event
 */

/**
 * Called when batch create an array of events on the API
 * @callback ConnectionEvents~eventBatchCreatedOnTheAPI
 * @param {Object} error - eventual error
 * @param {Event[]} events
 */
