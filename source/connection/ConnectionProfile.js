var apiPathProfile = '/profile/app';


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
Profile.prototype.get = function (key, callback) {
  function myCallBack(error, result) {
    if (key !== null && result) {
      result = result[key];
    }
    callback(error, result);
  }
  this.connection.request('GET', apiPathProfile, myCallBack);
};


/**
 * @example
 * // set x=25 and delete y
 * conn.profile.set({x : 25, y : null}, function(error) { console.log('done'); });
 *
 * @param {Object} keyValuePairs
 * @param {Connection~requestCallback} callback - handles the response
 */
Profile.prototype.set = function (keyValuePairs, callback) {
  this.connection.request('PUT', apiPathProfile, callback, keyValuePairs);
};


module.exports = Profile;