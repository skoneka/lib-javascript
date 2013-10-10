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
    fromTime: null,  // serverTime
    toTime: null,  // serverTime
    limit: null,
    skip: null,
    modifiedSince: null,
    state: null
  }, settings);
};

Filter.prototype.getData = function () {
  return this._settings;
};

Filter.prototype._fireFilterChange = function (signal, content, batch) {
  this._fireEvent(MSGs.ON_CHANGE, {filter: this, signal: signal, content: content}, batch);//generic
  this._fireEvent(signal, content, batch);
};

/**
 * Change sevral values of the filter in batch.. this wil group all events behind a batch id
 * @param keyValueMap
 * @param batch
 */
Filter.prototype.batchSet = function (keyValueMap, batch) {
  var myBatch = false;
  if (! batch) { batch = this.startBatch(); myBatch = true; }
  _.each(keyValueMap, function (value, key) {
    this._setValue(key, value, batch);
  }.bind(this));
  if (myBatch) { batch.done(); }
};

/**
 * Internal that take in charge of changing values
 * @param keyValueMap
 * @param batch
 * @private
 */
Filter.prototype._setValue = function (key, newValue, batch) {
  if (key === 'limit') {
    this._settings.limit = newValue;

    // TODO handle changes
    return;
  }


  if (key === 'timeFrameST') {
    if (! _.isArray(newValue) || newValue.length !== 2) {
      throw new Error('Filter.timeFrameST is an Array of two timestamps [fromTime, toTime]');
    }
    if (this._settings.fromTime !== newValue[0] || this._settings.toTime !== newValue[1]) {
      this._settings.fromTime = newValue[0];
      this._settings.toTime = newValue[1];
      this._fireFilterChange(MSGs.DATE_CHANGE, this.timeFrameST, batch);
    }
    return;
  }

  if (key === 'streamsIds') {
    if (newValue === null || typeof newValue === 'undefined') {
      if (this._settings.streams === null) {
        return;
      }
    } else if (! _.isArray(newValue)) {
      newValue = [newValue];
    }

    // TODO check that this stream is valid
    console.log(JSON.stringify(newValue));
    this._settings.streams = newValue;
    this._fireFilterChange(MSGs.STREAMS_CHANGE, this.streams, batch);

    return;
  }


  throw new Error('Filter has no property : ' + key);
};


/**
 * timeFrameChange ..  [fromTime, toTime]
 * setting them to "null" => ALL
 */
Object.defineProperty(Filter.prototype, 'timeFrameST', {
  get: function () {
    return [this._settings.toTime, this._settings.fromTime];
  },
  set: function (newValue) {
    this._setValue('timeFrameST', newValue);
    return this.timeFrameST;
  }
});


/**
 * StreamIds ..
 * setting them to "null" => ALL and to "[]" => NONE
 */
Object.defineProperty(Filter.prototype, 'streamsIds', {
  get: function () {
    return this._settings.streams;
  },
  set: function (newValue) {
    this._setValue('streamsIds', newValue);
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
