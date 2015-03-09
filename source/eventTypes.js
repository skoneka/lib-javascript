var utility = require('./utility/utility');

// staging cloudfront https://d1kp76srklnnah.cloudfront.net/dist/data-types/event-extras.json
// staging direct https://sw.pryv.li/dist/data-types/event-extras.json

var HOSTNAME = 'd1kp76srklnnah.cloudfront.net';
var PATH = '/dist/data-types/';

/**
 * Event types directory data.
 * @link http://api.pryv.com/event-types/
 */
var eventTypes = module.exports = {};

/**
 * @link http://api.pryv.com/event-types/#json-file
 * @param {Function} callback
 */
eventTypes.loadHierarchical = function (callback) {
  requestFile('hierarchical.json', function (err, result) {
    this._hierarchical = result;
    callback(err, result);
  }.bind(this));
};

eventTypes.hierarchical = function () {
  if (! this._hierarchical) {
    throw new Error('Load data via loadHierarchical() first');
  }
  return this._hierarchical;
};

/**
 * @link http://api.pryv.com/event-types/#json-file
 * @param {Function} callback
 */
eventTypes.loadFlat = function (callback) {
  requestFile('flat.json', function (err, result) {
    this._flat = result;
    if (callback && typeof(callback) === 'function') {
      callback(err, result);
    }
  }.bind(this));
};

eventTypes.flat = function (eventType) {
  if (! this._flat) {
    throw new Error('Load data via loadFlat() first');
  }
  return this._flat.types[eventType];
};

/**
 * @link http://api.pryv.com/event-types/#json-file
 * @param {Function} callback
 */
eventTypes.loadExtras = function (callback) {
  requestFile('extras.json', function (error, result) {
    this._extras = result;
    callback(error, result);
  }.bind(this));
};

eventTypes.extras = function (eventType) {
  if (! this._extras) {
    throw new Error('Load data via loadExtras() first');
  }
  var type = eventType.split('/');
  if (this._extras.extras[type[0]] && this._extras.extras[type[0]].formats[type[1]]) {
    return this._extras.extras[type[0]].formats[type[1]];
  }
  return null;
};

eventTypes.isNumerical = function (eventOrEventType) {
  if (! eventOrEventType) { return false; }
  var type;
  if (eventOrEventType.type) {
    type = eventOrEventType.type;
  } else {
    type = eventOrEventType;
  }
  var def = eventTypes.flat(type);
  if (! def) { return false; }
  return (def.type === 'number');
};

/**
 * @private
 * @param fileName
 * @param callback
 */
function requestFile(fileName, callback) {
  utility.request({
    method : 'GET',
    host : HOSTNAME,
    path : PATH + fileName,
    port : 443,
    ssl : true,
    withoutCredentials: true,
    success : function (result) { callback(null, result); },
    error : function (error) { callback(error, null); }
  });
}
