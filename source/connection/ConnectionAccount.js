var apiPathAccount = '/account';
var CC = require('./ConnectionConstants.js'),
    _ = require('lodash');

function Account(connection) {
  this.connection = connection;
}

Account.prototype.changePassword = function (oldPassword, newPassword, callback) {
  if (!_.isFunction(callback)) {
    throw new Error(CC.Errors.CALLBACK_IS_NOT_A_FUNCTION);
  }
  this.connection.request('POST', apiPathAccount + '/change-password', function (err) {
    callback(err);
  }, {'oldPassword': oldPassword, 'newPassword': newPassword});
};
Account.prototype.getInfo = function (callback) {
  if (!_.isFunction(callback)) {
    throw new Error(CC.Errors.CALLBACK_IS_NOT_A_FUNCTION);
  }
  this.connection.request('GET', apiPathAccount, function (error, result) {
    if (result && result.account) {
      result = result.account;
    }
    callback(error, result);
  });
};

module.exports = Account;