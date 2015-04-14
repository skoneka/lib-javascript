/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../test-support/config.js'),
  replay = require('replay'),
  async = require('async');

describe('Connection.accesses', function () {
  this.timeout(10000);

  var connection;


  before(function () {
    replay.mode = process.env.REPLAY || 'replay';
    Pryv.Connection.login(config.loginParams, function (err, newConnection) {
      connection = newConnection;
    });
  });

  after(function () {
    replay.mode = 'bloody';
  });

  describe('get()', function () {
    it('must return the list of connection accesses', function (done) {
      connection.accesses.get(function (err, res) {
        should.not.exist(err);
        should.exist(res);
        res.should.be.instanceOf(Array);
        res.forEach( function (access) {
          should.exist(access.id);
          should.exist(access.token);
          should.exist(access.name);
        });
        done();
      });
    });

    it('must return an error if...');

  });

  describe('create()', function () {

    // TODO: find out why it's impossible to create streams with the other connection
    var accessToDelete, testStream, streamConnection;

    before(function (done) {
      testStream = {
        id: 'accessTestStream',
        name: 'accessTestStream'
      };
      streamConnection = new Pryv.Connection(config.connectionSettings);
      streamConnection.streams.create(testStream, function (err, newStream) {
        testStream = newStream;
        console.log(require('util').inspect(err, {depth: null}));
        done(err);
      });
    });

    after(function (done) {
      async.series([
        function (stepDone) {
          connection.accesses.delete(accessToDelete.id, function (err) {
            stepDone(err);
          });
        },
        function (stepDone) {
          streamConnection.streams.delete(testStream, function (err, trashedStream) {
            testStream = trashedStream;
            stepDone(err);
          });
        },
        function (stepDone) {
          streamConnection.streams.delete(testStream, function (err) {
            stepDone(err);
          });
        }
      ], done);
    });

    it('must return the created access', function (done) {
      var testAccess = {
        type: 'shared',
        name: 'testAccess',
        permissions: [
          {
            streamId: testStream.id,
            level: 'read'
          }
        ]};
      connection.accesses.create(testAccess, function (err, newAccess) {
        should.not.exist(err);
        should.exist(newAccess);
        accessToDelete = newAccess;
        done();
      });
    });

    it('must return an error if the new access\'s parameters are invalid', function (done) {
      var invalidAccess = {
        type: 'wrongType',
        name: 'wrongAccess',
        permissions: [
          {
            streamId: testStream.id,
            level: 'wrongLevel'
          }
        ]};
      connection.accesses.create(invalidAccess, function (err) {
        should.exist(err);
        done();
      });
    });

  });

  describe('update()', function () {

    var testAccess, testStream, streamConnection;

    before(function (done) {
      testStream = {
        id: 'accessTestStream',
        name: 'accessTestStream'
      };
      testAccess = {
        type: 'shared',
        name: 'testAccess',
        permissions: [
          {
            streamId: testStream.id,
            level: 'read'
          }
        ]};

      streamConnection = new Pryv.Connection(config.connectionSettings);

      async.series([
        function (stepDone) {
          streamConnection.streams.create(testStream, function (err, newStream) {
            testStream = newStream;
            stepDone(err);
          });
        },
        function (stepDone) {
          connection.accesses.create(testAccess, function (err, newAccess) {
            testAccess = newAccess;
            console.log(newAccess);
            stepDone(err);
          });
        }
      ], done);

    });

    after(function (done) {
      async.series([
        function (stepDone) {
          connection.accesses.delete(testAccess.id, function (err) {
            stepDone(err);
          });
        },
        function (stepDone) {
          streamConnection.streams.delete(testStream, function (err, trashedStream) {
            testStream = trashedStream;
            stepDone(err);
          });
        },
        function (stepDone) {
          streamConnection.streams.delete(testStream, function (err) {
            stepDone(err);
          });
        }
      ], done);
    });

    it('must return the updated access', function (done) {
      testAccess.name = 'myNewAccessName';
      console.log('gonna update da access');
      console.log(testAccess);
      connection.accesses.update(testAccess, function (err, updatedAccess) {
        should.not.exist(err);
        should.exist(updatedAccess);
        testAccess.name.should.eql(updatedAccess.name);
        testAccess = updatedAccess;
        done();
      });
    });

    it('must return an error if the updated access\'s parameteres are invalid');

  });

  describe.skip('delete()', function () {

    var testAccess;

    before(function (done) {
      testAccess = {

      };
      connection.accesses.create(testAccess, function (err, newAccess) {
        testAccess = newAccess;
        done(err);
      });
    });

    it('must return ', function (done) {
      connection.accesses.delete(testAccess.id, function (err, result) {
        should.not.exist(err);
        should.exist(result);
        done(err);
      });
    });

  });


});