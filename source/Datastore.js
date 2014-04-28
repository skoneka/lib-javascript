/**
 * DataStore handles in memory caching of objects.
 * @private
 */

var _ = require('underscore');
var Event = require('./Event');

function Datastore(connection) {
  this.connection = connection;
  this.streamsIndex = {}; // streams are linked to their object representation
  this.eventIndex = {}; // events are store by their id
  this.rootStreams = [];
}

module.exports = Datastore;

Datastore.prototype.init = function (callback) {
  this.connection.streams._getObjects({state: 'all'}, function (error, result) {
    if (error) { return callback('Datastore faild to init - '  + error); }
    if (result) {
      this._rebuildStreamIndex(result); // maybe done transparently
    }
    callback(null, result);
  }.bind(this));

  // TODO activate monitoring
};

Datastore.prototype._rebuildStreamIndex = function (streamArray) {
  this.streamsIndex = {};
  this.rootStreams = [];
  this._indexStreamArray(streamArray);
};

Datastore.prototype._indexStreamArray = function (streamArray) {
  _.each(streamArray, function (stream) {
    this.indexStream(stream);
  }.bind(this));
};

Datastore.prototype.indexStream = function (stream) {
  this.streamsIndex[stream.id] = stream;
  if (! stream.parentId) { this.rootStreams.push(stream); }
  this._indexStreamArray(stream._children);
  delete stream._children; // cleanup when in datastore mode
  delete stream._parent;
};

/**
 *
 * @param streamId
 * @returns Stream or null if not found
 */
Datastore.prototype.getStreams = function () {
  return this.rootStreams;
};


/**
 *
 * @param streamId
 * @param test (do no throw error if Stream is not found
 * @returns Stream or null if not found
 */
Datastore.prototype.getStreamById = function (streamId, test) {
  var result = this.streamsIndex[streamId];
  if (! test && ! result) {
    throw new Error('Datastore.getStreamById cannot find stream with id: ' + streamId);
  }
  return result;
};

//-------------------------

/**
 * @param serialId
 * @returns Event or null if not found
 */
Datastore.prototype.getEventBySerialId = function (serialId) {
  var result = null;
  _.each(this.eventIndex, function (event /*,eventId*/) {
    if (event.serialId === serialId) { result = event; }
    // TODO optimize and break
  }.bind(this));
  return result;
};

/**
 * @param eventID
 * @returns Event or null if not found
 */
Datastore.prototype.getEventById = function (eventId) {
  return this.eventIndex[eventId];

};

/**
 * @returns allEvents
 */
Datastore.prototype.getEventsMatchingFilter = function (filter) {
  var result = [];
  _.each(this.eventIndex, function (event /*,eventId*/) {
    if (filter.matchEvent(event)) { result.push(event); }
  }.bind(this));
  return result;
};


/**
 * @returns allEvents
 */
Datastore.prototype.getAllEvents = function () {
  return _.value(this.eventIndex);
};

/**
 * @param event
 */
Datastore.prototype.addEvent = function (event) {
  if (! event.id) {
    throw new Error('Datastore.addEvent cannot add event with unkown id', event);
  }
  this.eventIndex[event.id] = event;
};



/**
 * @param {Object} data to map
 * @return {Event} event
 */
Datastore.prototype.createOrReuseEvent = function (data) {
  if (! data.id) {
    console.log(data);
    throw new Error('Datastore.createOrReuseEvent cannot create event with ' +
      ' unkown id' + require('util').inspect(data));
  }

  var result = this.getEventById(data.id);
  if (result) {  // found event
    _.extend(result, data);
    return result;
  }
  // create an event and register it
  result = new Event(this.connection, data);
  this.addEvent(result);

  return result;

};


