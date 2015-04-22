/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../test-support/config.js'),
  replay = require('replay');

describe('Connection.profile', function () {
  this.timeout(10000);
  var connection;

  before(function (done) {
    replay.mode = process.env.REPLAY || 'replay';
      Pryv.Connection.login(config.loginParams, function (err, newConnection) {
        connection = newConnection;
        done(err);
      });
  });

  after(function () {
    replay.mode = 'bloody';
  });

  describe('getPrivate()', function () {

    it('must return the user\'s private profile set', function (done) {
      connection.profile.getPrivate(null, function (err, res) {
        should.not.exist(err);
        should.exist(res);
        console.log('privateProfile: ', res);
        done(err);
      });
    });
  });

  describe('getPublic()', function () {

    it('must return the user\'s current public profile set', function (done) {
      var connection = new Pryv.Connection(config.connectionSettings);
      connection.profile.getPublic(null, function (err, res) {
        should.not.exist(err);
        should.exist(res);
        console.log('public profile: ', res);
        done();
      });
    });
  });

  describe('setPrivate()', function () {
    
  });

  describe('setPublic()', function () {

  });

  describe('getTimeLimits()', function () {

  });

});