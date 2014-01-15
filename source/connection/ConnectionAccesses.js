var apiPathAccesses = '/accesses';

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
  this.connection.request('GET', apiPathAccesses, callback);
};

Accesses.prototype.create = function (access, callback) {
  this.connection.request('POST', apiPathAccesses, callback, access);
};
module.exports = Accesses;