var _ = require('underscore'),
  SignalEmitter = require('./utility/SignalEmitter.js'),
  Filter = require('./Filter.js');


var EXTRA_ALL_EVENTS = {state : 'all', modifiedSince : -100000000 };

/**
 * Monitoring
 * @type {Function}
 * @constructor
 */
function Monitor(connection, filter) {
  SignalEmitter.extend(this, Messages, 'Monitor');
  this.connection = connection;
  this.id = 'M' + Monitor.serial++;

  this.filter = filter;

  this._lastUsedFilterData = filter.getData();

  if (this.filter.state) {
    throw new Error('Monitors only work for default state, not trashed or all');
  }

  this.filter.addEventListener(Filter.Messages.ON_CHANGE, this._onFilterChange.bind(this));
  this._events = null;

}

Monitor.serial = 0;

var Messages = Monitor.Messages = {
  /** content: events **/
  ON_LOAD : 'started',
  /** content: error **/
  ON_ERROR : 'error',
  /** content: { enter: [], leave: [], change } **/
  ON_EVENT_CHANGE : 'eventsChanged',
  /** content: streams **/
  ON_STRUCTURE_CHANGE : 'streamsChanged',
  /** content: ? **/
  ON_FILTER_CHANGE : 'filterChanged'
};

// ----------- prototype  public ------------//

Monitor.prototype.start = function (done) {
  done = done || function () {};

  this.lastSynchedST = -1000000000000;
  this._initEvents();

  //TODO move this logic to ConnectionMonitors ??
  this.connection.monitors._monitors[this.id] = this;
  this.connection.monitors._startMonitoring(done);
};


Monitor.prototype.destroy = function () {
  //TODO move this logic to ConnectionMonitors ??
  delete this.connection.monitors._monitors[this.id];
  if (_.keys(this.connection.monitors._monitors).length === 0) {
    this.connection.monitors._stopMonitoring();
  }
};

Monitor.prototype.getEvents = function () {
  if (! this._events || ! this._events.active) {return []; }
  return _.toArray(this._events.active);
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
  this._connectionEventsGetChanges(Messages.ON_EVENT_CHANGE);
};
Monitor.prototype._onIoStreamsChanged = function () {
  console.log('SOCKETIO', '_onIoStreamsChanged');
  this._connectionStreamsGetChanges(Messages.ON_STRUCTURE_CHANGE);
};



// -----------  filter changes ----------- //


Monitor.prototype._saveLastUsedFilter = function () {
  this._lastUsedFilterData = this.filter.getData();
};


Monitor.prototype._onFilterChange = function (signal, batchId, batch) {
  var changes = this.filter.compareToFilterData(this._lastUsedFilterData);

  var processLocalyOnly = 0;
  var foundsignal = 0;
  if (signal.signal === Filter.Messages.DATE_CHANGE) {  // only load events if date is wider
    foundsignal = 1;
    console.log('** DATE CHANGE ', changes.timeFrame);
    if (changes.timeFrame === 0) {
      return;
    }
    if (changes.timeFrame < 0) {  // new timeFrame contains more data
      processLocalyOnly = 1;
    }

  }

  if (signal.signal === Filter.Messages.STREAMS_CHANGE) {
    foundsignal = 1;
    console.log('** STREAMS_CHANGE', changes.streams);
    if (changes.streams === 0) {
      return;
    }
    if (changes.streams < 0) {  // new timeFrame contains more data
      processLocalyOnly = 1;
    }
  }


  if (! foundsignal) {
    throw new Error('Signal not found :' + signal.signal);
  }

  this._saveLastUsedFilter();



  if (processLocalyOnly) {
    this._refilterLocaly(Messages.ON_FILTER_CHANGE, {filterInfos: signal}, batch);
  } else {
    this._connectionEventsGetAllAndCompare(Messages.ON_FILTER_CHANGE, {filterInfos: signal}, batch);
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


Monitor.prototype._initEvents = function () {
  this.lastSynchedST = this.connection.getServerTime();
  this._events = { active : {}};
  this.connection.events.get(this.filter.getData(true, EXTRA_ALL_EVENTS),
    function (error, events) {
      if (error) { this._fireEvent(Messages.ON_ERROR, error); }
      _.each(events, function (event) {
        this._events.active[event.id] = event;
      }.bind(this));
      this._fireEvent(Messages.ON_LOAD, events);
    }.bind(this));
};


Monitor.prototype._connectionEventsGetChanges = function (signal) {
  var options = { modifiedSince : this.lastSynchedST, state : 'all'};
  this.lastSynchedST = this.connection.getServerTime();

  var result = { created : [], trashed : [], modified: []};

  this.connection.events.get(this.filter.getData(true, options),
    function (error, events) {
      if (error) {
        this._fireEvent(Messages.ON_ERROR, error);
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

Monitor.prototype._connectionStreamsGetChanges = function (signal) {
  var streams = {};
  var created = [], modified = [], trashed = [];
  var streamCompare = function (streamA, streamB) {
    var sA = _.pick(streamA, ['id', 'name', 'parentId', 'singleActivity', 'clientData', 'trashed']);
    var sB = _.pick(streamB, ['id', 'name', 'parentId', 'singleActivity', 'clientData', 'trashed']);
    return _.isEqual(sA, sB);
  };
  var getFlatTree = function (stream) {
    streams[stream.id] = stream;
    _.each(stream.children, function (child) {
      getFlatTree(child);
    });
  };
  var checkChangedStatus = function (stream) {

    if (!streams[stream.id]) {
      created.push(stream);
    } else if (!streamCompare(streams[stream.id], stream)) {
      if (streams[stream.id].trashed !== stream.trashed) {
        if (!stream.trashed) {
          created.push(stream);
        } else {
          trashed.push(stream);
        }
      } else {
        modified.push(stream);
      }
    }
    _.each(stream.children, function (child) {
      checkChangedStatus(child);
    });
  };
  _.each(this.connection.datastore.getStreams(), function (rootStream) {
    getFlatTree(rootStream);
  });
  this.connection.fetchStructure(function (error, result) {
    _.each(result, function (rootStream) {
      checkChangedStatus(rootStream);
    });
    this._fireEvent(signal, { created : created, trashed : trashed, modified: modified});
  }.bind(this));
};


Monitor.prototype._connectionEventsGetAllAndCompare = function (signal, extracontent, batch) {
  this.lastSynchedST = this.connection.getServerTime();


  // look into in-memory events for matching events..

  var result1 = { enter : [] };
  _.extend(result1, extracontent);

  var cachedEvents = this.connection.datastore.getEventsMatchingFilter(this.filter);
  _.each(cachedEvents, function (event) {
    if (! this._events.active[event.id]) {  // we don't care for already known event
      this._events.active[event.id] = event; // store it
      result1.enter.push(event);
    }
  }.bind(this));
  if (result1.enter.length > 0) {
    console.log('yo');
    this._fireEvent(signal, result1, batch);
  }

  // look online

  var result = { enter : [] };
  _.extend(result, extracontent); // pass extracontent to receivers

  var toremove = _.clone(this._events.active);

  this.connection.events.get(this.filter.getData(true, EXTRA_ALL_EVENTS),
    function (error, events) {
      if (error) { this._fireEvent(Messages.ON_ERROR, error); }
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
Monitor.prototype.stats = function (force, callback) {
  this.connection.profile.getTimeLimits(force, callback);
};

module.exports = Monitor;


