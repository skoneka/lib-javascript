var apiPathAccesses = '/accesses';
var _ = require('lodash'),
  CC = require('./ConnectionConstants.js');

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
  var params = {
    method: 'GET',
    path: apiPathAccesses,
    callback: function (err, res) {
      if (!_.isFunction(callback)) {
        throw new Error(CC.Errors.CALLBACK_IS_NOT_A_FUNCTION);
      }
      if (err) {
        return callback(err);
      }
      var accesses = res.accesses || res.access;
      callback(null, accesses);
    }
  };
  this.connection.request(params);
};

/**
 * TODO complete documentation
 * @param access
 * @param callback
 */
Accesses.prototype.create = function (access, callback) {
  var params = {
    method: 'POST',
    path: apiPathAccesses,
    callback: function (err, res) {
      if (!_.isFunction(callback)) {
        throw new Error(CC.Errors.CALLBACK_IS_NOT_A_FUNCTION);
      }
      if (err) {
        return callback(err);
      }
      callback(err, res.access);
    },
    jsonData: access
  };
  this.connection.request(params);
};

/**
 * TODO complete documentation
 * @param access
 * @param callback
 */
Accesses.prototype.update = function (access, callback) {
  if (!_.isFunction(callback)) {
    throw new Error(CC.Errors.CALLBACK_IS_NOT_A_FUNCTION);
  }
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
};

/**
 * TODO complete documentation
 * @param accessId
 * @param callback
 */
Accesses.prototype.delete = function (accessId, callback) {
  this.connection.request('DELETE', apiPathAccesses + '/' + accessId, function (err, result) {
    if (!_.isFunction(callback)) {
      throw new Error(CC.Errors.CALLBACK_IS_NOT_A_FUNCTION);
    }
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};
module.exports = Accesses;