var _ = require('underscore');

var SignalEmitter = require('./utility/SignalEmitter.js');
var MSGs = require('./Messages.js').Filter;

var Filter = module.exports = function (settings) {
  // protect against calls without `new`
  if (! (this instanceof Filter)) {
    return new Filter(settings);
  }
  SignalEmitter.extend(this, MSGs, 'Filter');

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


// TODO
// redundant with get
function _normalizeTimeFrameST(filterData) {
  var result = [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
  if (filterData.fromTime || filterData.fromTime === 0) {
    result[0] = filterData.fromTime;
  }
  if (filterData.toTime || filterData.toTime === 0) {
    result[1] = filterData.toTime;
  }
  return result;
}



/**
 * check if this event is in this filter
 */
Filter.prototype.matchEvent = function (event) {
  if (event.time > this.toTimeSTNormalized) { return 0; }
  if (event.time < this.fromTimeSTNormalized) { return 0; }


  if (this._settings.streams &&  this._settings.streams.indexOf(event.streamId) < 0) {
    return 0;
  }


  // TODO complete test
  return 1;
};

/**
 * Compare this filter with data form anothe filter
 * @param filterData data got with filter.getData
 * @returns keymap { timeFrame : -1, 0 , 1 }
 * (1 = more than test, -1 = less data than test, 0 == no changes)
 */
Filter.prototype.compareToFilterData = function (filterDataTest) {
  var result = { timeFrame : 0, streams : 0 };


  // timeFrame
  var myTimeFrameST = [this.fromTimeSTNormalized, this.toTimeSTNormalized];
  var testTimeFrameST = _normalizeTimeFrameST(filterDataTest);
  console.log(myTimeFrameST);
  console.log(testTimeFrameST);

  if (myTimeFrameST[0] < testTimeFrameST[0]) {
    result.timeFrame = 1;
  } else if (myTimeFrameST[0] > testTimeFrameST[0]) {
    result.timeFrame = -1;
  }
  if (result.timeFrame <= 0) {
    if (myTimeFrameST[1] > testTimeFrameST[1]) {
      result.timeFrame = 1;
    } else  if (myTimeFrameST[1] < testTimeFrameST[1]) {
      result.timeFrame = -1;
    }
  }

  // streams
  //TODO look if this processing can be optimized

  var nullStream = 0;
  if (! this._settings.streams) {
    if (filterDataTest.streams) {
      result.streams = 1;
    }
    nullStream = 1;
  }
  if (! filterDataTest.streams) {
    if (this._settings.streams) {
      result.streams = -1;
    }
    nullStream = 1;
  }

  if (! nullStream) {
    var notinTest = _.difference(this._settings.streams, filterDataTest.streams);
    if (notinTest.length > 0) {
      result.streams = 1;
    } else {
      var notinLocal = _.difference(filterDataTest.streams, this._settings.streams);
      if (notinLocal.length > 0) {
        result.streams = -1;
      }
    }
  }

  return result;
};

/**
 * Create a clone of this filter and changes some properties
 * @param properties
 * @returns Pryv.Filter
 */
Filter.prototype.cloneWithDelta = function (properties) {
  var newProps = _.clone(this._settings);
  _.extend(newProps, properties);
  return new Filter(newProps);
};

/**
 *
 * @param ignoreNulls (optional) boolean
 * @param withDelta (optional) apply this differences on the datar
 * @returns {*}
 */
Filter.prototype.getData = function (ignoreNulls, withDelta) {
  ignoreNulls = ignoreNulls || false;
  var result = _.clone(this._settings);
  if (withDelta)  {
    _.extend(result, withDelta);
  }
  _.each(_.keys(result), function (key) {
    if (result[key] === null) { delete result[key]; }
  });
  return result;
};

Filter.prototype._fireFilterChange = function (signal, content, batch) {
  this._fireEvent(MSGs.ON_CHANGE, {filter: this, signal: signal, content: content}, batch);//generic
  this._fireEvent(signal, content, batch);
};

/**
 * Change several values of the filter in batch.. this wil group all events behind a batch id
 * @param keyValueMap
 * @param batch
 */
Filter.prototype.set = function (keyValueMap, batch) {

  var myBatch = false;
  if (! batch && _.keys(keyValueMap).length > 1) {
    batch = this.startBatch('set');
    myBatch = true;
  }

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
  var waitForMe = batch ? batch.waitForMeToFinish() : null;

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
    if (waitForMe) { waitForMe.done(); }
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
    this._settings.streams = newValue;
    this._fireFilterChange(MSGs.STREAMS_CHANGE, this.streams, batch);
    if (waitForMe) { waitForMe.done(); }
    return;
  }

  if (waitForMe) { waitForMe.done(); }
  throw new Error('Filter has no property : ' + key);
};

/**
 * get toTime, return Number.POSITIVE_INFINITY if null
 */
Object.defineProperty(Filter.prototype, 'toTimeSTNormalized', {
  get: function () {
    if (this._settings.toTime || this._settings.toTime === 0) {
      return this._settings.toTime;
    }
    return Number.POSITIVE_INFINITY;
  }
});

/**
 * get toTime, return Number.POSITIVE_INFINITY if null
 */
Object.defineProperty(Filter.prototype, 'fromTimeSTNormalized', {
  get: function () {
    if (this._settings.fromTime || this._settings.fromTime === 0) {
      return this._settings.fromTime;
    }
    return Number.NEGATIVE_INFINITY;
  }
});



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
