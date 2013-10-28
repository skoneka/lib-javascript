
var _ = require('underscore');

var RW_PROPERTIES =
  ['streamId', 'time', 'duration', 'type', 'content', 'tags', 'description',
    'clientData', 'state', 'modified'];

/**
 *
 * @type {Function}
 * @constructor
 */
var Event = module.exports = function (connection, data) {
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





Object.defineProperty(Event.prototype, 'stream', {
  get: function () {
    if (! this.connection.datastore) {
      throw new Error('Activate localStorage to get automatic stream mapping. Or use StreamId');
    }
    return this.connection.streams.getById(this.streamId);
  },
  set: function () { throw new Error('Event.stream property is read only'); }
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
