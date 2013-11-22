
var System = require('./system/System.js');
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
  System.request({
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
eventTypes.loadHierachical = function (callback) {
  _getFile('hierarchical.json', callback);
};

/**
 * @link http://api.pryv.com/event-typez.html#about-json-file
 * @param {eventTypes~contentCallback} callback
 */
eventTypes.loadFlat = function (callback) {
  _getFile('flat.json', callback);
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
    throw new Error('Call eventTypes.loadExtras, before access extras');
  }
  var type = eventType.split('/');
  if (this._extras.extras[type[0]] && this._extras.extras[type[0]].formats[type[1]]) {
    return this._extras.extras[type[0]].formats[type[1]];
  }
  return null;
};


/**
 * Called with the result of the request
 * @callback eventTypes~contentCallback
 * @param {Object} error - eventual error
 * @param {Object} result - jSonEncoded result
 */
