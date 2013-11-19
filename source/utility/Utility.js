var _ = require('underscore');

var isBrowser = function () {
  return typeof(window) !== 'undefined';
};


var Utility =  module.exports =  isBrowser() ?
  require('./Utility-browser.js') : require('./Utility-node.js');

module.exports = Utility;

/**
 * return true if environment is a web browser
 * @returns {boolean}
 */
Utility.isBrowser = isBrowser;


Utility.SignalEmitter = require('./SignalEmitter.js');

/**
 * Merge two object (key/value map) and remove "null" properties
 * @param {Object} sourceA
 * @param {Object} sourceB
 * @returns {*|Block|Node|Tag}
 */
Utility.mergeAndClean = function (sourceA, sourceB) {
  sourceA = sourceA || {};
  sourceB = sourceB || {};
  var result = _.clone(sourceA);
  _.extend(result, sourceB);
  _.each(_.keys(result), function (key) {
    if (result[key] === null) { delete result[key]; }
  });
  return result;
};

/**
 * Create a query string from an object (key/value map)
 * @param {Object} data
 * @returns {String} key1=value1&key2=value2....
 */
Utility.getQueryParametersString = function (data) {
  data = this.mergeAndClean(data);
  return Object.keys(data).map(function (key) {
    if (data[key] !== null) {
      if (_.isArray(data[key])) {
        data[key] = this.mergeAndClean(data[key]);
        var keyE = encodeURIComponent(key + '[]');
        return data[key].map(function (subData) {
          return keyE + '=' + encodeURIComponent(subData);
        }).join('&');
      } else {
        return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
      }
    }
  }, this).join('&');
};

/**
 * Common regexp
 * @type {{username: RegExp, email: RegExp}}
 */
Utility.regex = {
  username :  /^([a-zA-Z0-9])(([a-zA-Z0-9\-]){3,21})([a-zA-Z0-9])$/,
  email : /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
};

/**
 * Cross platform string endsWith
 * @param {String} str
 * @param {String} suffix
 * @returns {boolean}
 */
Utility.endsWith = function (str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

