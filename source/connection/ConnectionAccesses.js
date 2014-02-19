var apiPathAccesses = '/accesses';
var _ = require('underscore');

/**
 * @class Accesses
 * @link http://api.pryv.com/reference.html#methods-accesses
 * @link http://api.pryv.com/reference.html#data-structure-access
 * @param {Connection} connection
 * @constructor
 */
function Accesses(connection) {
  this.connection = connection;
}
/**
 * @param {Connection~requestCallback} callback
 */
Accesses.prototype.get = function (callback) {
  this.connection.request('GET', apiPathAccesses, function (err, res) {
    var accesses = res.accesses || res.access;
    if (typeof(callback) === 'function') {
      callback(err, accesses);
    }
  });
};

Accesses.prototype.create = function (access, callback) {
  this.connection.request('POST', apiPathAccesses, function (err, res) {
    var access = res.access;
    if (typeof(callback) === 'function') {
      callback(err, access);
    }
  }, access);
};
Accesses.prototype.update = function (access, callback) {
  if (access.id) {
    this.connection.request('PUT', apiPathAccesses + '/' + access.id, callback,
      _.pick(access, 'name', 'deviceName', 'permissions'));
  } else {
    if (callback && _.isFunction(callback)) {
      return callback('No access id found');
    }

  }
};

Accesses.prototype.delete = function (sharingId, callback) {
  this.connection.request('DELETE', apiPathAccesses + '/' + sharingId, function (err, result) {
    var error = err;
    if (result && result.message) {
      error = result;
    }
    callback(error, result);
  });
};
module.exports = Accesses;