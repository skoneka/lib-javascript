//file: connection

var Connection = function (username, auth) {
  this.username = username;
  this.auth = auth;

};

Connection.prototype = {
  username: null,
  auth: null,
  domain : 'pryv.io'
};


module.exports = Connection;
