
var System = require('./system/System.js');
var eventTypes = module.exports = { };

var HOSTNAME = 'api.pryv.com';
var PATH = '/event-types/';


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
    success : function (result) { callback(null, result); },
    error : function (error) { callback(error, null); }
  });
}

/**
 * @link http://api.pryv.com/event-typez.html#about-json-file
 * @param {eventTypes~contentCallback} callback
 */
eventTypes.hierachical = function (callback) {
  _getFile('hierarchical.json', callback);
};

/**
 * @link http://api.pryv.com/event-typez.html#about-json-file
 * @param {eventTypes~contentCallback} callback
 */
eventTypes.flat = function (callback) {
  _getFile('flat.json', callback);
};

/**
 * @link http://api.pryv.com/event-typez.html#about-json-file
 * @param {eventTypes~contentCallback} callback
 */
eventTypes.extras = function (callback) {
  _getFile('extras.json', callback);
};

/**
 * Called with the result of the request
 * @callback eventTypes~contentCallback
 * @param {Object} error - eventual error
 * @param {Object} result - jSonEncoded result
 */
