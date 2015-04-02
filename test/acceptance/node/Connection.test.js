/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../test-support/config.js'),
  replay = require('replay');

describe('Connection', function () {
  this.timeout(20000);

  before(function () {
    replay.mode = process.env.REPLAY || 'replay';
  });

  after(function () {
    replay.mode = 'bloody';
  });

  // instantiate Connection
  describe('Connection()', function () {

    it('must construct a Connection object with the provided parameters', function (done) {
      var connection = new Pryv.Connection(config.connectionSettings);
      should.exist(connection);
      done();
    });

    it('must return an error when constructor parameters are invalid', function (done) {
      var invalidSettings =  null;
      var caughtError, connection;
      try {
        connection = new Pryv.Connection(invalidSettings);
      } catch (error) {
        caughtError = error;
      }
      should.exist(caughtError);
      done();
    });
  });

  // TODO: not implemented yet
  describe('attachCredentials()', function () {

    it('must accept username and token credentials');
  });

  // find out if authorize and login need to be combined or left separate
  // with a before() clause on login()
  describe('authorize()', function () {

  });

  describe('login()', function () {

  });

  describe('fetchStructure()', function () {

    it('must return the streams structure', function (done) {
      var connection = new Pryv.Connection(config.connectionSettings);
      connection.fetchStructure(function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.be.instanceOf(Array);
        done();
      });
    });

    // TODO find fail cases
    it('must return an error message when ..?');
  });

  describe('accessInfo()', function () {

    it('must return this connection\'s access info', function (done) {
      var connection = new Pryv.Connection(config.connectionSettings);
      connection.accessInfo( function (err, result) {
        should.not.exist(err);
        should.exist(result);
        done();
      });
    });

    it('must return an error if the username/token are invalid', function (done) {
      var invalidConnectionSettings = {
        username: 'fakeUser',
        auth: 'xxxxx',
        staging: true
      };
      var connection = new Pryv.Connection(invalidConnectionSettings);
      connection.accessInfo( function (err) {
        should.exist(err);
        done();
      });
    });
  });

  describe('privateProfile()', function () {

    it('must return this connection\'s private profile', function (done) {
      var connection = new Pryv.Connection(config.connectionSettings);
      connection.privateProfile( function (err, result) {
        should.not.exist(err);
        should.exist(result);
        done();
      });
    });
  });

  describe('getLocalTime()', function () {

    it('must return the local time', function (done) {
      var connection = new Pryv.Connection(config.connectionSettings);
      should.exist(connection.getLocalTime(new Date().getTime() + 1000));
      done();
    });
  });

  describe('getServerTime()', function () {

    it('must return the server time', function (done) {
      var connection = new Pryv.Connection(config.connectionSettings);
      should.exist(connection.getLocalTime(new Date().getTime()));
      done();
    });
  });

  describe('monitor()', function () {

    var connection = new Pryv.Connection(config.connectionSettings);

    it('must instantiate a monitor with the provided filter', function (done) {
      var filter = new Pryv.Filter();
      filter.streams = ['diary', 'activity'];
      connection.monitor(filter);
      done();
    });

    it('must instantiate a monitor with null filter', function (done) {
      connection.monitor(null);
      done();
    });
  });

  // do tests? do only unit tests? because its usage is already tested in other modules
  // (ConnectionEvents,ConnectionStreams, ...
  describe('request()', function () {

    it('must ');
  });

});