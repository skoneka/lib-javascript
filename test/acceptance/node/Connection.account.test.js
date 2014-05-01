/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
    should = require('should'),
    config = require('../test-support/config.js'),
    replay = require('replay');

// TODO: need a connection with personal access;
describe('Connection.account', function () {
  var connection = new Pryv.Connection(config.connectionSettings);

  before(function () {
    replay.mode = process.env.REPLAY || 'replay';
  });

  after(function () {
    replay.mode = 'bloody';
  });

  describe('getInfo()', function () {
    it('must return user account info (e.g. username, email, language)'/*, function (done) {
        connection.account.getInfo(function (error, result) {
        should.not.exist(error);
        should.exist(result);
        result.should.have.properties('username', 'email', 'language');
        done();
        });
        }*/);

    it('must return an error when the connection lacks sufficient permissions', function (done) {
      connection.account.getInfo(function (error) {
        should.exist(error);
        done();
      });
    });
  });

  describe('changePassword()', function () {
    it('must change the account password');

    it('must return an error when the given "old" password is not valid', function (done) {
      connection.account.changePassword('wrongpassword', 'dontcare', function (error) {
        should.exist(error);
        done();
      });
    });

    it('must return an error when the given "new" password does not match requirements');

    it('must return an error when the connection lacks sufficient permissions', function (done) {
      connection.account.changePassword('dontcare', 'dontcare', function (error) {
        should.exist(error);
        done();
      });
    });
  });
});
