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
  this.timeLimits = null;
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

Profile.prototype.getTimeLimits = function (force, callback) {
  if (!force && this.timeLimits) {
    if (callback && typeof(callback) === 'function') {
      callback(this.timeLimits);
    }
  } else {
    var i = 2;
    this.timeLimits = {
      timeFrameST : [],
      timeFrameLT : []
    };
    this.connection.events.get({
      toTime: 9900000000,
      fromTime: 0,
      limit: 1,
      sortAscending: false,
      state: 'all'
    }, function (error, events) {
      if (!error && events) {
        this.timeLimits.timeFrameST[1] = events[0].time;
        this.timeLimits.timeFrameLT[1] = events[0].timeLT;
      }
      i--;
      if (i === 0) {
        if (callback && typeof(callback) === 'function') {
          callback(this.timeLimits);
        }
      }
    }.bind(this));
    this.connection.events.get({
      toTime: 9900000000,
      fromTime: 0,
      limit: 1,
      sortAscending: true,
      state: 'all'
    }, function (error, events) {
      if (!error && events) {
        this.timeLimits.timeFrameST[0] = events[0].time;
        this.timeLimits.timeFrameLT[0] = events[0].timeLT;
      }
      i--;
      if (i === 0) {
        if (callback && typeof(callback) === 'function') {
          callback(this.timeLimits);
        }
      }
    }.bind(this));
  }
};
module.exports = Profile;