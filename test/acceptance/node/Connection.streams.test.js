/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../test-support/config.js'),
  replay = require('replay');

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
    it('must return a tree of non-trashed Stream objects by default', function (done) {
      connection.streams.get(null, function (error, streams) {
        should.not.exist(error);
        should.exist(streams);

        (function checkStreams(array) {
          array.should.be.instanceOf(Array);
          array.forEach(function (stream) {
            stream.should.be.instanceOf(Pryv.Stream);
            should.not.exist(stream.trashed);
            if (stream.children) {
              checkStreams(stream.children);
            }
          });
        })(streams);

        done();
      });
    });

    it('must return streams matching the given filter', function (done) {
      var filter = { parentId: 'diary', state: 'all' };
      connection.streams.get(filter, function (error, streams) {
        streams.forEach(function (stream) {
          stream.parentId.should.equal(filter.parentId);
        });
        done();
      });
    });

    it('must return an empty array if there are no matching streams', function (done) {
      var filter = {parentId: 'notes'}; // be sure that this stream has no child
      connection.streams.get(filter, function (error, streams) {
        should.not.exist(error);
        streams.length.should.equal(0);
        done();
      });
    });

    it('must return an error if the given filter contains invalid parameters', function (done) {
      var filter = { parentId: 42, state: 'toto' };
      connection.streams.get(filter, function (error, streams) {
        should.exist(error);
        should.not.exist(streams);
        done();
      });
    });
  });

  describe('create()', function () {
    it('must accept a stream-like object and return a Stream object');

    it('must accept an array of stream-like objects and return an array of Stream objects');

    it('must return streams with default values for unspecified properties');

    it('must return an error if the given stream data is invalid');

    it('must return an error for each invalid stream (when given multiple items)');
  });

  describe('update()', function () {
    it('must accept a Stream object and return the updated stream');

    it('must accept an array of Stream objects');

    it('must return an error if the stream is invalid');
  });

  describe('delete()', function () {
    it('must accept a stream-like object and return a Stream object flagged as trashed');

    it('must return null when deleting an already-trashed stream');

    it('must accept a stream id');

    it('must delete linked events by default when deleting an already-trashed stream');

    it('must merge linked events into the parent stream when specified');

    it('must return an error when the specified stream does not exist');
  });
});
