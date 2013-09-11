
var Utility = {};

var _ = require('underscore');

Utility.MergeAndClean = function (sourceA, sourceB) {
  sourceA = sourceA || {};
  sourceB = sourceB || {};
  var result = _.clone(sourceA);
  _.extend(result, sourceB);
  _.each(_.keys(result), function (key) {
    if (result[key] === null) { delete result[key]; }
  });
  return result;
};

Utility.URLParametersFromJSON = function (data) {
  return Object.keys(data).map(function (k) {
    if (_.isArray(data[k])) {
      var keyE = encodeURIComponent(k + '[]');
      return data[k].map(function (subData) {
        return keyE + '=' + encodeURIComponent(subData);
      }).join('&');
    } else {
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }
  }).join('&');
};

module.exports = Utility;
