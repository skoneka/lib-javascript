/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../test-support/config.js'),
  replay = require('replay'),
async = require('async');

describe('Connection.accesses', function () {
  this.timeout(10000);

  var connection = new Pryv.Connection(config.connectionSettings);

  before(function () {
    replay.mode = process.env.REPLAY || 'replay';
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
        done();
      });
    });

    it('must return an error if...');

  });

  describe('create()', function () {

    var accessToDelete, testStream;

    before(function (done) {
      testStream = {
        id: 'accessTestStream',
        name: 'accessTestStream'
      };
      connection.streams.create(testStream, function (err, newStream) {
        testStream = newStream;
        done(err);
      });
    });

    after(function (done) {
      async.series([
        function (stepDone) {
          connection.accesses.delete(accessToDelete.id, function (err, result) {
            console.log(result);
            stepDone(err);
          });
        },
        function (stepDone) {
          connection.streams.delete(testStream, function (err, trashedStream) {
            testStream = trashedStream;
            stepDone(err);
          });
        },
        function (stepDone) {
          connection.streams.delete(testStream, function (err) {
            stepDone(err);
          });
        }
      ], done);
    });

    it('must return the created access', function (done) {
      var access = {
        type: 'shared',
        name: 'testAccess',
        permissions: [
        {
          streamId: testStream.id,
          level: 'read'
        }
      ]};
      connection.accesses.create(access, function (err, newAccess) {
        should.not.exist(err);
        should.exist(newAccess);
        accessToDelete = newAccess;
        done();
      });
    });

    it('must return an error if the new access\'s parameters are invalid', function (done) {
      var invalidAccess = {};
      connection.accesses.create(invalidAccess, function (err) {
        should.exist(err);
        done();
      });
    });

  });

  describe.skip('update()', function () {

    var testAccess;

    before(function (done) {
      testAccess = {

      };
      connection.accesses.create(testAccess, function (err, newAccess) {
        testAccess = newAccess;
        done(err);
      });
    });

    after(function (done) {
      connection.accesses.delete(testAccess.id, function (err) {
        done(err);
      });
    });

    it('must return the updated access', function (done) {
      testAccess.name = 'myNewAccessName';
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