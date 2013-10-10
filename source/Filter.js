var _ = require('underscore');

var SignalEmitter = require('./Utility/SignalEmitter.js');
var MSGs = require('./Messages.js').Filter;

var Filter = module.exports = function (settings) {
  // protect against calls without `new`
  if (! (this instanceof Filter)) {
    return new Filter(settings);
  }
  SignalEmitter.extend(this, MSGs);

  this._settings = _.extend({
    //TODO: set default values
    streams: null, //ids
    tags: null,
    from: null,
    to: null,
    limit: null,
    skip: null,
    modifiedSince: null,
    state: null
  }, settings);
};

Filter.prototype.getData = function () {
  return this._settings;
};

Filter.prototype._fireFilterChange = function (signal, content) {
  this._fireEvent(MSGs.ON_CHANGE, {filter: this, signal: signal, content: content});//generic event
  this._fireEvent(signal, content);
};

/**
 * StreamIds ..
 * setting them to "null" => ALL and to "[]" => NONE
 */
Object.defineProperty(Filter.prototype, 'streamsIds', {
  get: function () {
    return this._settings.streams;
  },
  set: function (newValue) {
    if (newValue === null) {
      if (this._settings.streams === null) {
        return this._settings.streams;
      }
    } else if (! _.isArray(newValue)) {
      newValue = [newValue];
    }

    this._settings.streams = newValue;
    this._fireFilterChange(MSGs.STREAMS_CHANGE, this.streams);
    return this._settings.streams;
  }
});




//TODO: remove or rewrite (name & functionality unclear)
Filter.prototype.focusedOnSingleStream = function () {
  if (_.isArray(this._settings.streams) && this._settings.streams.length === 1) {
    return this._settings.streams[0];
  }
  return null;
};
