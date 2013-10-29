var _ = require('underscore');
var SignalEmitter = require('../utility/SignalEmitter.js');
var MSGs =  require('../Messages.js');
var MyMsgs = MSGs.Monitor;


var EXTRA_ALL_EVENTS = {state : 'all', modifiedSince : -100000000 };

/**
 *
 * @type {Function}
 * @constructor
 */
var Monitor = module.exports = function (connection, filter) {
  SignalEmitter.extend(this, MyMsgs, 'Monitor');
  this.connection = connection;
  this.id = 'M' + Monitor.serial++;

  this.filter = filter;

  this._lastUsedFilterData = filter;

  if (this.filter.state) {
    throw new Error('Monitors only work for default state, not trashed or all');
  }

  this.filter.addEventListener(MSGs.Filter.ON_CHANGE, this._onFilterChange.bind(this));
  this._events = null;

};

Monitor.serial = 0;


// ----------- prototype  public ------------//

Monitor.prototype.start = function (done) {
  done = done || function () {};

  this.lastSynchedST = -1000000000000;
  this._connectionEventsGetAll();

  this.connection._ioSocketMonitors[this.id] = this;
  this.connection._startMonitoring(done);
};


Monitor.prototype.destroy = function () {
  delete this.connection._ioSocketMonitors[this.id];
  if (_.keys(this.connection._ioSocketMonitors).length === 0) {
    this.connection._stopMonitoring();
  }
};

Monitor.prototype.getEvents = function () {
  if (! this.events || ! this._events.active) {return []; }
  return this._events.active;
};

// ------------ private ----------//

// ----------- iOSocket ------//
Monitor.prototype._onIoConnect = function () {
  console.log('Monitor onConnect');
};
Monitor.prototype._onIoError = function (error) {
  console.log('Monitor _onIoError' + error);
};
Monitor.prototype._onIoEventsChanged = function () {
  this._connectionEventsGetChanges(MyMsgs.ON_EVENT_CHANGE);
};
Monitor.prototype._onIoStreamsChanged = function () { };



// -----------  filter changes ----------- //


Monitor.prototype._saveLastUsedFilter = function () {
  this._lastUsedFilterData = this.filter.getData();
};


Monitor.prototype._onFilterChange = function (signal, batchId, batch) {
  var changes = this.filter.compareToFilterData(this._lastUsedFilterData);

  var processLocalyOnly = 1;
  var foundsignal = 0;
  if (signal.signal === MSGs.Filter.DATE_CHANGE) {  // only load events if date is wider
    foundsignal = 1;
    console.log('** DATE CHANGE ', changes.timeFrame);
    if (changes.timeFrame === 0) {
      return;
    }
    if (changes.timeFrame < 0) {  // new timeFrame contains more data
      processLocalyOnly = 0;
    }

  }

  if (signal.signal === MSGs.Filter.STREAMS_CHANGE) {
    foundsignal = 1;
    console.log('** STREAMS_CHANGE', changes.streams);
    if (changes.streams === 0) {
      return;
    }
    if (changes.streams < 0) {  // new timeFrame contains more data
      processLocalyOnly = 0;
    }
  }


  if (! foundsignal) {
    throw new Error('Signal not found :' + signal.signal);
  }

  this._saveLastUsedFilter();




  if (processLocalyOnly) {
    this._refilterLocaly(MyMsgs.ON_FILTER_CHANGE, {filterInfos: signal}, batch);
  } else {
    this._connectionEventsGetAllAndCompare(MyMsgs.ON_FILTER_CHANGE, {filterInfos: signal}, batch);
  }
};

// ----------- internal ----------------- //

/**
 * Process events locally
 */
Monitor.prototype._refilterLocaly = function (signal, extracontent, batch) {

  var result = { enter : [], leave : [] };
  _.extend(result, extracontent); // pass extracontent to receivers
  _.each(_.clone(this._events.active), function (event) {
    if (! this.filter.matchEvent(event)) {
      result.leave.push(event);
      delete this._events.active[event.id];
    }
  }.bind(this));
  this._fireEvent(signal, result, batch);
};

/**
 *
 */
Monitor.prototype._connectionEventsGetAll = function () {
  this.lastSynchedST = this.connection.getServerTime();
  this._events = { active : {}};
  this.connection.events.get(this.filter.getData(true, EXTRA_ALL_EVENTS),
    function (error, events) {
      if (error) { this._fireEvent(MyMsgs.ON_ERROR, error); }
      _.each(events, function (event) {
        this._events.active[event.id] = event;
      }.bind(this));
      this._fireEvent(MyMsgs.ON_LOAD, events);
    }.bind(this));
};


Monitor.prototype._connectionEventsGetChanges = function (signal) {
  var options = { modifiedSince : this.lastSynchedST, state : 'all'};
  this.lastSynchedST = this.connection.getServerTime();

  var result = { created : [], trashed : [], modified: []};

  this.connection.events.get(this.filter.getData(true, options),
    function (error, events) {
      if (error) {
        this._fireEvent(MyMsgs.ON_ERROR, error);
      }

      _.each(events, function (event) {
        if (this._events.active[event.id]) {
          if (event.trashed) { // trashed
            result.trashed.push(event);
            delete this._events.active[event.id];
          } else {
            result.modified.push(event);
          }
        } else {
          result.created.push(event);
        }
      }.bind(this));

      this._fireEvent(signal, result);
    }.bind(this));
};


Monitor.prototype._connectionEventsGetAllAndCompare = function (signal, extracontent, batch) {
  this.lastSynchedST = this.connection.getServerTime();



  var result = { enter : [] };
  _.extend(result, extracontent); // pass extracontent to receivers

  var toremove = _.clone(this._events.active);

  this.connection.events.get(this.filter.getData(true, EXTRA_ALL_EVENTS),
    function (error, events) {
      if (error) { this._fireEvent(MyMsgs.ON_ERROR, error); }
      _.each(events, function (event) {
        if (this._events.active[event.id]) {  // already known event we don't care
          delete toremove[event.id];
        } else {
          this._events.active[event.id] = event;
          result.enter.push(event);
        }
      }.bind(this));
      _.each(_.keys(toremove), function (streamid) {
        delete this._events.active[streamid]; // cleanup not found streams
      }.bind(this));
      result.leave = _.values(toremove); // unmatched events are to be removed
      this._fireEvent(signal, result, batch);
    }.bind(this));

};


/**
 * return informations on events
 */
Monitor.prototype.stats = function () {

  var result = {
    timeFrameST : [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
    timeFrameLT : [null, null]
  };
  _.each(this._events.active, function (event) {
    if (event.time < result.timeFrameST[0]) {
      result.timeFrameST[0] = event.time;
      result.timeFrameLT[0] = event.timeLT;
    }
    if (event.time > result.timeFrameST[1]) {
      result.timeFrameST[1] = event.time;
      result.timeFrameLT[1] = event.timeLT;
    }
  });
  return result;
};




