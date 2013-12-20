
var _ = require('underscore');

var RW_PROPERTIES =
  ['streamId', 'time', 'duration', 'type', 'content', 'tags', 'description',
    'clientData', 'state', 'modified'];

/**
 *
 * @type {Function}
 * @constructor
 */
var Event = module.exports = function Event(connection, data) {
  this.connection = connection;
  this.serialId = this.connection.serialId + '>E' + this.connection._eventSerialCounter++;
  _.extend(this, data);
};

/**
 * get Json object ready to be posted on the API
 */
Event.prototype.getData = function () {
  var data = {};
  _.each(RW_PROPERTIES, function (key) { // only set non null values
    if (_.has(this, key)) { data[key] = this[key]; }
  }.bind(this));
  return data;
};
/**
 *
 * @param {Connection~requestCallback} callback
 */
Event.prototype.update = function (callback) {
  this.connection.events.update(this, callback);
};
/**
 *
 * @param {Connection~requestCallback} callback
 */
Event.prototype.addAttachment = function (file, callback) {
  this.connection.events.addAttachment(this.id, file, callback);
};
/**
 *
 * @param {Connection~requestCallback} callback
 */
Event.prototype.removeAttachment = function (fileName, callback) {
  this.connection.events.removeAttachment(this.id, fileName, callback);
};
/**
 *
 * @param {Connection~requestCallback} callback
 */
Event.prototype.trash = function (callback) {
  this.connection.events.trash(this, callback);
};
Object.defineProperty(Event.prototype, 'timeLT', {
  get: function () {
    return this.connection.getLocalTime(this.time);
  },
  set: function (newValue) {
    this.time = this.connection.getServerTime(newValue);
  }
});




Object.defineProperty(Event.prototype, 'stream', {
  get: function () {
    if (! this.connection.datastore) {
      throw new Error('call connection.fetchStructure before to get automatic stream mapping.' +
        ' Or use StreamId');
    }
    return this.connection.streams.getById(this.streamId);
  },
  set: function () { throw new Error('Event.stream property is read only'); }
});

Object.defineProperty(Event.prototype, 'url', {
  get: function () {
    var url = this.connection.settings.ssl ? 'https://' : 'http://';
    url += this.connection.username + '.' + this.connection.settings.domain + '/events/' + this.id;
    return url;
  },
  set: function () { throw new Error('Event.url property is read only'); }
});

Object.defineProperty(Event.prototype, 'attachmentsUrl', {
  get: function () {
    var url = this.connection.settings.ssl ? 'https://' : 'http://';
    url += this.connection.username + '.' + this.connection.settings.domain + ':3443/events/' +
      this.id + '.jpg?auth=' + this.connection.auth;
    return url;
  },
  set: function () { throw new Error('Event.attachmentsUrl property is read only'); }
});

/**
 * An newly created Event (no id, not synched with API)
 * or an object with sufficient properties to be considered as an Event.
 * @typedef {(Event|Object)} NewEventLike
 * @property {String} streamId
 * @property {String} type
 * @property {number} [time]
 */
