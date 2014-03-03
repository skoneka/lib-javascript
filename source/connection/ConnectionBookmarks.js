var apiPathBookmarks = '/followed-slices',
  Connection = require('../Connection.js'),
  _ = require('underscore');

/**
 * @class Bookmarks
 * @link http://api.pryv.com/reference.html#data-structure-subscriptions-aka-bookmarks
 * @param {Connection} connection
 * @constructor
 */
function Bookmarks(connection, Conn) {
  this.connection = connection;
  Connection = Conn;
}
/**
 * @param {Connection~requestCallback} callback
 */
Bookmarks.prototype.get = function (callback) {
  this.connection.request('GET', apiPathBookmarks, function (error, res) {
    var result = [],
      bookmarks = res.followedSlices || res.followedSlice;
    _.each(bookmarks, function (bookmark) {
      bookmark.url = bookmark.url.replace(/\.li/, '.in');
      bookmark.url = bookmark.url.replace(/\.me/, '.io');
      var conn =  new Connection({
        auth: bookmark.accessToken,
        url: bookmark.url,
        name: bookmark.name,
        bookmarkId: bookmark.id
      });
      result.push(conn);
    });
    callback(error, result);
  });
};

Bookmarks.prototype.create = function (bookmark, callback) {
  if (bookmark.name && bookmark.url && bookmark.accessToken) {
    this.connection.request('POST', apiPathBookmarks, function (err, result) {
      var error = err;
      if (!error) {
        var conn =  new Connection({
          auth: bookmark.accessToken,
          url: bookmark.url,
          name: bookmark.name,
          bookmarkId: result.followedSlice.id
        });
        bookmark = conn;
      }
      callback(error, bookmark);
    }, bookmark);
    return bookmark;
  }
};
Bookmarks.prototype.delete = function (bookmarkId, callback) {
  this.connection.request('DELETE', apiPathBookmarks + '/' + bookmarkId, function (err, result) {
    var error = err;
    if (result && result.message) {
      error = result;
    }
    callback(error, result);
  });
};

module.exports = Bookmarks;