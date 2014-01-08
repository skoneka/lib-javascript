var apiPathBookmarks = '/bookmarks';

/**
 * @class Bookmarks
 * @link http://api.pryv.com/reference.html#data-structure-subscriptions-aka-bookmarks
 * @param {Connection} connection
 * @constructor
 */
function Bookmarks(connection) {
  this.connection = connection;
}
/**
 * @param {Connection~requestCallback} callback
 */
Bookmarks.prototype.get = function (callback) {
  this.connection.request('GET', apiPathBookmarks, callback);
};

module.exports = Bookmarks;