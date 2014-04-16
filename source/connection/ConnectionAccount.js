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

module.exports = Account;