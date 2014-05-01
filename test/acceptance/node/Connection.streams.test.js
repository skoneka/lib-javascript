/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../test-support/config.js'),
  replay = require('replay');
replay.mode = 'bloody';
// TODO: wait to have test account with given data to update tests
// (i.e number of trashed stream/children)
describe('Connection.streams', function () {
  this.timeout(5000);
  var connection = new Pryv.Connection(config.connectionSettings);

  before(function () {
    replay.mode = process.env.REPLAY || 'replay';
  });
  after(function () {
    replay.mode = 'bloody';
  });

  describe('get()', function () {
    it('must return a tree of non trashed Stream object by default', function (done) {
      connection.streams.get(null, function (error, result) {
        should.not.exist(error);
        should.exist(result);
        result.should.be.instanceOf(Array);
        result.forEach(function (stream) {
          stream.should.be.instanceOf(Pryv.Stream);
          should.not.exist(stream.trashed);
          if (stream.children) {
            // Test only the first level of children
            stream.children.forEach(function (child) {
              child.should.be.instanceOf(Pryv.Stream);
              should.not.exist(child.trashed);
            });
          }
        });
        done();
      });
    });

    it('must return streams matching the given filter', function (done) {
      var filter = {parentId: 'diary', state: 'all'};
      connection.streams.get(filter, function (error, result) {
        result.forEach(function (stream) {
          stream.parentId.should.equal(filter.parentId);
        });
        done();
      });
    });
    it('must return an empty array if there are no streams', function (done) {
      var filter = {parentId: 'notes'}; // be sure that this stream got no child
      connection.streams.get(filter, function (error, result) {
        should.not.exist(error);
        result.length.should.equal(0);
        done();
      });
    });
    it('must return an error if the given filter had unvalid parameters', function (done) {
      var filter = {parentId: 42, state: 'toto'};
      connection.streams.get(filter, function (error, result) {
        should.exist(error);
        should.not.exist(result);
        done();
      });
    });
  });
  describe('create()', function () {
    it('must accept an stream like object and return an Stream object');
    it('must accept an array of stream like object an Stream array');
    it('must return Streams with complementary properties and id');
    it('must return an error when an unvalid stream is given');
    it('must return an error for each unvalid stream given');
  });

  describe('update()', function () {
    it('must accept Stream object only');
    it('must accept Stream array only');
    it('must return updated Stream object');
    it('must return an error if stream is unvalid');
  });

  describe('delete()', function () {
    it('must accept Stream object/id or array');
    it('must return an Stream object flaged as trashed');
    it('must by default delete linked events (mergeEventsWithParent set to false)');
    it('must return null when the stream is already flaged as trashed');
    it('must return an error when event is unvalid');
  });
});
