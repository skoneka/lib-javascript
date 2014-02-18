var apiPathPrivateProfile = '/profile/private';
var apiPathPublicProfile = '/profile/app';


/**
 * @class Profile
 @link http://api.pryv.com/reference.html#methods-app-profile
 * @param {Connection} connection
 * @constructor
 */
function Profile(connection) {
  this.connection = connection;
}



/**
 * @param {String | null} key
 * @param {Connection~requestCallback} callback - handles the response
 */
Profile.prototype._get = function (path, key, callback) {

  function myCallBack(error, result) {
    console.warn(result);
    result = result.profile || null;
    if (key !== null && result) {
      result = result[key];
    }
    callback(error, result);
  }
  this.connection.request('GET', path, myCallBack);
};
Profile.prototype.getPrivate = function (key, callback) {
  this._get(apiPathPrivateProfile, key, callback);
};
Profile.prototype.getPublic = function (key, callback) {
  this._get(apiPathPublicProfile, key, callback);
};


/**
 * @example
 * // set x=25 and delete y
 * conn.profile.set({x : 25, y : null}, function(error) { console.log('done'); });
 *
 * @param {Object} keyValuePairs
 * @param {Connection~requestCallback} callback - handles the response
 */
Profile.prototype._set = function (path, keyValuePairs, callback) {
  this.connection.request('PUT', path, callback, keyValuePairs);
};
Profile.prototype.setPrivate = function (key, callback) {
  this._set(apiPathPrivateProfile, key, callback);
};
Profile.prototype.setPublic = function (key, callback) {
  this._set(apiPathPublicProfile, key, callback);
};


module.exports = Profile;