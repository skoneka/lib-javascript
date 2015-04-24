var apiPathAccesses = '/accesses';
var _ = require('lodash');

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
    if (typeof(callback) === 'function') {
      if (err) {
        return callback(err);
      }
      var accesses = res.accesses || res.access;
      callback(null, accesses);
    }
  });
};

/**
 * TODO complete documentation
 * @param access
 * @param callback
 */
Accesses.prototype.create = function (access, callback) {
  this.connection.request('POST', apiPathAccesses, function (err, res) {
    if (typeof(callback) === 'function') {
      if (err) {
        return callback(err);
      }
      callback(err, res.access);
    }
  }, access);
};

/**
 * TODO complete documentation
 * @param access
 * @param callback
 */
Accesses.prototype.update = function (access, callback) {
  if (typeof(callback) === 'function') {
    if (access.id) {
      this.connection.request('PUT', apiPathAccesses + '/' + access.id, function (err, res) {
          if (err) {
            return callback(err);
          }
          callback(err, res.access);
        },
        _.pick(access, 'name', 'deviceName', 'permissions'));
    } else {
      return callback('No access id found');
    }
  }
};

/**
 * TODO complete documentation
 * @param accessId
 * @param callback
 */
Accesses.prototype.delete = function (accessId, callback) {
  this.connection.request('DELETE', apiPathAccesses + '/' + accessId, function (err, result) {
    if (typeof(callback) === 'function') {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    }
  });
};
module.exports = Accesses;