var apiPathAccount = '/account';

function Account(connection) {
  this.connection = connection;
}

Account.prototype.changePassword = function (oldPassword, newPassword, callback) {
  this.connection.request('POST', apiPathAccount + '/change-password', function (err) {
    if (typeof(callback) === 'function') {
      callback(err);
    }
  }, {'oldPassword': oldPassword, 'newPassword': newPassword});
};
Account.prototype.getInfo = function (callback) {
  this.connection.request('GET', apiPathAccount, function (error, result) {
    if (typeof(callback) === 'function') {
      if (result && result.account) {
        result = result.account;
      }
      callback(error, result);
    }
  });
};

module.exports = Account;