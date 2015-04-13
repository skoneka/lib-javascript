/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../test-support/config.js'),
  replay = require('replay'),
  utility = require('../../../source/utility/utility.js');

describe('Connection', function () {
  this.timeout(10000);

  before(function () {
    replay.mode = process.env.REPLAY || 'replay';
  });

  after(function () {
    replay.mode = 'bloody';
  });

  // instantiate Connection
  describe('Connection()', function () {

    it.skip('must construct a Connection object with the provided parameters', function (done) {
      var connection = new Pryv.Connection(config.connectionSettings);
      should.exist(connection);
      done();
    });

    it.skip('must return an error when constructor parameters are invalid', function (done) {
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

    it('must accept username and token credentials', function (done) {
      var offlineCon = new Pryv.Connection();

      var uName = 'user';
      var tk = 'token';

      offlineCon.attachCredentials({
        username: uName,
        token: tk
      });

      should.exist(offlineCon.username);
      should.exist(offlineCon.token);
      offlineCon.username.should.be.eql(uName);
      offlineCon.token.should.be.eql(tk);
    });
  });

  // find out if authorize and login need to be combined or left separate
  // with a before() clause on login()
  describe('authorize()', function () {

  });

  describe('login()', function () {
    it('must return a Connection with an access token of type personal', function (done) {
      var username = 'perkikiki';
      var password = 'poilonez';
      var appId = 'pryv-test-app';
      var domain = utility.urls.domains.server.staging;
      var origin = utility.urls.domains.client.staging;
      Pryv.Connection.login(username, password, appId, domain, origin, function (err, newConnection) {
        should.not.exist(err);
        should.exist(newConnection);
        newConnection.accessInfo( function (err, result) {
          should.not.exist(err);
          should.exist(result);
          result.type.should.be.eql('personal');
          done();
        });
      });

    });

  });

  describe.skip('fetchStructure()', function () {

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

    it.skip('must return this connection\'s access info', function (done) {
      var connection = new Pryv.Connection(config.connectionSettings);
      connection.accessInfo( function (err, result) {
        should.not.exist(err);
        should.exist(result);
        done();
      });
    });

    it.skip('must return an error if the username/token are invalid', function (done) {
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

    it.skip('must return this connection\'s private profile', function (done) {
      var connection = new Pryv.Connection(config.connectionSettings);
      connection.privateProfile( function (err, result) {
        should.not.exist(err);
        should.exist(result);
        done();
      });
    });
  });

  describe('getLocalTime()', function () {

    it.skip('must return the local time', function (done) {
      var connection = new Pryv.Connection(config.connectionSettings);
      should.exist(connection.getLocalTime(new Date().getTime() + 1000));
      done();
    });
  });

  describe('getServerTime()', function () {

    it.skip('must return the server time', function (done) {
      var connection = new Pryv.Connection(config.connectionSettings);
      should.exist(connection.getLocalTime(new Date().getTime()));
      done();
    });
  });

  describe.skip('monitor()', function () {

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