/**
 * (event)Emitter renamed to avoid confusion with prvy's events
 */


var _ = require('underscore');

var SignalEmitter = module.exports = function (messagesMap) {
  SignalEmitter.extend(this, messagesMap);
};


SignalEmitter.extend = function (object, messagesMap) {
  object._signalEmitterEvents = {};
  _.each(_.values(messagesMap), function (value) {
    object._signalEmitterEvents[value] = [];
  });
  _.extend(object, SignalEmitter.prototype);
};


SignalEmitter.Messages = {
  /** called when a batch of changes is expected, content: <batchId> unique**/
  BATCH_BEGIN : 'beginBatch',
  /** called when a batch of changes is done, content: <batchId> unique**/
  BATCH_DONE : 'doneBatch',
  /** if an eventListener return this string, it will be removed automatically **/
  UNREGISTER_LISTENER : 'unregisterMePlease'
};

/**
 * Add an event listener
 * @param signal one of  MSGs.SIGNAL.*.*
 * @param callback function(content) .. content vary on each signal.
 * If the callback returns SignalEmitter.Messages.UNREGISTER_LISTENER it will be removed
 * @return the callback function for further reference
 */
SignalEmitter.prototype.addEventListener = function (signal, callback) {
  this._signalEmitterEvents[signal].push(callback);
  return callback;
};


/**
 * remove the callback matching this signal
 */
SignalEmitter.prototype.removeEventListener = function (signal, callback) {
  for (var i = 0; i < this._signalEmitterEvents[signal].length; i++) {
    if (this._signalEmitterEvents[signal][i] === callback) {
      this._signalEmitterEvents[signal][i] = null;
    }
  }
};


/**
 * A changes occurred on the filter
 * @param signal
 * @param content
 * @param batch
 * @private
 */
SignalEmitter.prototype._fireEvent = function (signal, content, batch) {
  var batchId = batch ? batch.id : null;
  if (! signal) { throw new Error(); }
  console.log('FireEvent : ' + signal + ' batch: ' + batchId);
  _.each(this._signalEmitterEvents[signal], function (callback) {
    if (callback !== null &&
      SignalEmitter.Messages.UNREGISTER_LISTENER === callback(content, batchId)) {
      this.removeEventListener(signal, callback);
    }
  }, this);
};


SignalEmitter.batchSerial = 0;
/**
 * start a batch process
 * @return an object where you have to call stop when done
 */
SignalEmitter.prototype.startBatch = function () {
  var batch = {
    id : 'C' + SignalEmitter.batchSerial++,
    filter : this,
    waitFor : 1,
    waitForMeToFinish : function (name) {
      var batch = this;
      batch.waitFor++;
      return {
        done : function () {
          batch.done(name);
        }
      };
    },
    done : function (name) {
      this.waitFor--;
      if (this.waitFor === 0) {
        this.filter._fireEvent(SignalEmitter.Messages.BATCH_DONE, this.id, this);
      }
      if (this.waitFor < 0) {
        console.error('This batch has been done() to much :' + name);
      }
    }
  };
  this._fireEvent(SignalEmitter.Messages.BATCH_BEGIN, batch.id, batch);
  return batch;
};