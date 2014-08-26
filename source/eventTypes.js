
var utility = require('./utility/utility');
var eventTypes = module.exports = { };

// staging cloudfront https://d1kp76srklnnah.cloudfront.net/dist/data-types/event-extras.json
// staging direct https://sw.pryv.li/dist/data-types/event-extras.json

var HOSTNAME = 'd1kp76srklnnah.cloudfront.net';
var PATH = '/dist/data-types/';


/**
 * @private
 * @param fileName
 * @param callback
 */
function _getFile(fileName, callback) {
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

/**
 * @link http://api.pryv.com/event-typez.html#about-json-file
 * @param {eventTypes~contentCallback} callback
 */
eventTypes.loadHierarchical = function (callback) {
  var myCallback = function (error, result) {
    this._hierarchical = result;
    callback(error, result);
  };
  _getFile('hierarchical.json', myCallback.bind(this));
};

eventTypes.hierarchical = function () {
  if (!this._hierarchical) {
    throw new Error('Call eventTypes.loadHierarchical, before accessing hierarchical');
  }
  return this._hierarchical;
};



/**
 * @link http://api.pryv.com/event-typez.html#about-json-file
 * @param {eventTypes~contentCallback} callback
 */

eventTypes.loadFlat = function (callback) {
  var myCallback = function (error, result) {
    this._flat = result;
    if (callback && typeof(callback) === 'function') {
      callback(error, result);
    }
  };
  _getFile('flat.json', myCallback.bind(this));
};
eventTypes.loadFlat();

eventTypes.flat = function (eventType) {
  if (!this._flat) {
    throw new Error('Call eventTypes.loadFlat, before accessing flat');
  }
  return this._flat.types[eventType];
};

/**
 * @link http://api.pryv.com/event-typez.html#about-json-file
 * @param {eventTypes~contentCallback} callback
 */
eventTypes.loadExtras = function (callback) {
  var myCallback = function (error, result) {
    this._extras = result;
    callback(error, result);
  };
  _getFile('extras.json', myCallback.bind(this));
};

eventTypes.extras = function (eventType) {
  if (!this._extras) {
    throw new Error('Call eventTypes.loadExtras, before accessing extras');
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
 * Called with the result of the request
 * @callback eventTypes~contentCallback
 * @param {Object} error - eventual error
 * @param {Object} result - jSonEncoded result
 */
