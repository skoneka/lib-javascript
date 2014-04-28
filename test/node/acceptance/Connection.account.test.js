/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../../data/config.js'),
  replay = require('replay');
replay.mode = 'bloody';

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
    it('must return an object with username, email and language as properties');
    /*it('must return an object with username, email and language as properties', function (done) {
      connection.account.getInfo(function (error, result) {
        should.not.exist(error);
        should.exist(result);
        result.should.have.properties('username', 'email', 'language');
        done();
      });
    });*/
    it('must return an error when the connection dont have sufficient right', function (done) {
      connection.account.getInfo(function (error) {
        should.exist(error);
        done();
      });
    });
  });
  describe('changePassword()', function () {
    it('must no return error when given password is valid');
    it('must return error when given password is wrong');
    it('must return an error when the connection dont have sufficient right', function (done) {
      var password = 'dontcare';
      var newPassword = 'dontcare';
      connection.account.changePassword(password, newPassword, function (error) {
        should.exist(error);
        done();
      });
    });
    /*it('must no return error when given password is valid', function (done) {
     var password = 'poilonez';
     var newPassword = 'poilonez';
     connection.account.changePassword(password, newPassword, function (error) {
     should.not.exist(error);
     done();
     });
     });
     it('must return error when given password is wrong', function (done) {
     var password = 'wrongpassword';
     var newPassword = 'poilonez';
     connection.account.changePassword(password, newPassword, function (error) {
     should.exist(error);
     done();
     });
     }); */
  });
});