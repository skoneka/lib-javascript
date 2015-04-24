/* global describe, it, afterEach */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../test-support/config.js');

// TODO: need a connection with personal access;
describe('Connection.account', function () {
  this.timeout(10000);

  var connection = new Pryv.Connection(config.connectionSettings);

  describe('getInfo()', function () {

    // TODO: returns error forbidden using current access token
    it.skip('must return user account info (e.g. username, email, language)', function (done) {
      connection.account.getInfo(function (error, result) {
        should.not.exist(error);
        should.exist(result);
        result.should.have.properties('username', 'email', 'language');
        done();
      });
    });

    it('must return an error when the connection lacks sufficient permissions', function (done) {
      connection.account.getInfo(function (error) {
        should.exist(error);
        done();
      });
    });
  });

  // TODO: find out what access token is required to change the password
  describe.skip('changePassword()', function () {

    var newPassword = 'testPassword';
    var truePassword = 'poilonez';

    afterEach(function (done) {
      connection.account.changePassword(newPassword, truePassword, function (err, result) {
        should.exist(result);
        done(err);
      });
    });

    it('must change the account password', function (done) {
      connection.account.changePassword(truePassword, newPassword, function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.have.properties('oldPassword', 'newPassword');
        result.oldPassword.should.eql(truePassword);
        result.newPassword.should.eql(newPassword);
        done(err);
      });
    });

    it('must return an error when the given "old" password is not valid', function (done) {
      connection.account.changePassword('wrongpassword', 'dontcare', function (error) {
        should.exist(error);
        done();
      });
    });

    it('must return an error when the given "new" password does not match requirements',
      function (done) {
      var invalidNewPassword = '';
      connection.account.changePassword(truePassword, invalidNewPassword, function (err) {
        should.exist(err);
        done();
      });
    });

    it('must return an error when the connection lacks sufficient permissions', function (done) {
      connection.account.changePassword('dontcare', 'dontcare', function (error) {
        should.exist(error);
        done();
      });
    });
  });
});
