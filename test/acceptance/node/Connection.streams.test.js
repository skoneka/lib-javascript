/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../test-support/config.js'),
  replay = require('replay'),
  async = require('async');

// TODO: wait to have test account with given data to update tests
// (i.e number of trashed stream/children)
describe('Connection.streams', function () {
  this.timeout(20000);
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
    var streamParent = {
      id: 'libjs-test-stream-parent-update',
      name: 'libjs-test-stream-parent-update',
      parentId: null
    };
    var streamToUpdate = {
      name: 'libjs-test-stream-update-to-update',
      parentId: streamParent.id
    };
    var streamToMove = {
      name: 'libjs-test-stream-update-to-move',
      parentId: streamParent.id
    };

    before(function (done) {
      async.series([
        function (stepDone) {
          connection.streams.delete(streamParent.id, function () {
            return stepDone();
          });
        },
        function (stepDone) {
          connection.streams.delete(streamParent.id, function () {
            return stepDone();
          });
        },
        function (stepDone) {
          connection.streams.create(streamParent, function (error, stream) {
            if (error) {
              return stepDone(error);
            }
            streamParent = stream;
            return stepDone();
          });
        },
        function (stepDone) {
          connection.streams.create(streamToUpdate, function (error, stream) {
            if (error) {
              return stepDone(error);
            }
            streamToUpdate = stream;
            return stepDone();
          });
        },
        function (stepDone) {
          connection.streams.create(streamToMove, function (error, stream) {
            if (error) {
              return stepDone(error);
            }
            streamToMove = stream;
            return stepDone();
          });
        }
      ], done);
    });


    it('must accept a Stream object and return the updated stream', function (done) {
      streamToUpdate.name = 'libjs-test-stream2';
      connection.streams.update(streamToUpdate, function (error, updatedStream) {
        should.not.exist(error);
        should.exist(updatedStream);
        updatedStream.should.be.instanceOf(Pryv.Stream);
        updatedStream.name.should.equal('libjs-test-stream2');
        done();
      });
    });

    it('must accept an array of Stream objects');

    it('must return an error if the stream is invalid');

    it('must update the stream tree when the parent was updated', function (done) {
      streamToMove.parentId = streamToUpdate.id;
      connection.streams.update(streamToMove, function (error, updatedStream) {
        should.not.exist(error);
        should.exist(updatedStream);
        updatedStream.should.be.instanceOf(Pryv.Stream);
        updatedStream.parentId.should.equal(streamToUpdate.id);
        done();
      }.bind(this));
    });
  });

  describe('delete()', function () {
    var eventToMerge = {
      time: 1404155270,
      type: 'note/txt',
      content: 'libjs-test-stream-delete-to-merge'
    };
    var eventNoMerge1 = {
      time: 1404155270,
      type: 'note/txt',
      content: 'libjs-test-stream-delete-no-merge1'
    };
    var eventNoMerge2 = {
      time: 1404155270,
      type: 'note/txt',
      content: 'libjs-test-stream-delete-no-merge2'
    };
    var streamParent = {
      id: 'libjs-test-stream-parent',
      name: 'libjs-test-stream-parent',
      parentId: null
    };
    var streamToTrashSimple1 = {
      parentId: streamParent.id,
      name: 'libjs-test-stream-delete-trash1'
    };
    var streamToTrashSimple2 = {
      parentId: streamParent.id,
      name: 'libjs-test-stream-delete-trash2',
      trashed: true
    };
    var streamToTrashChildMerge = {
      parentId: streamParent.id,
      name: 'libjs-test-stream-delete-child-merge'
    };
    var streamToTrashNoMerge1 = {
      parentId: streamParent.id,
      name: 'libjs-test-stream-delete-no-merge1'
    };
    var streamToTrashNoMerge2 = {
      parentId: streamParent.id,
      name: 'libjs-test-stream-delete-no-merge2'
    };

    before(function (done) {
      async.series([
        function (stepDone) {
          connection.streams.delete(streamParent.id, function () {
            return stepDone();
          }, false);
        },
        function (stepDone) {
          connection.streams.delete(streamParent.id, function () {
            return stepDone();
          }, false);
        },
        function (stepDone) {
          connection.streams.create(streamParent, function (error, stream) {
            if (error) {
              return stepDone(error);
            }
            streamParent = stream;
            return stepDone();
          });
        },
        function (stepDone) {
          connection.streams.create(streamToTrashSimple1, function (error, stream) {
            if (error) {
              return stepDone(error);
            }
            streamToTrashSimple1 = stream;
            return stepDone();
          });
        },
        function (stepDone) {
          connection.streams.create(streamToTrashSimple2, function (error, stream) {
            if (error) {
              return stepDone(error);
            }
            streamToTrashSimple2 = stream;
            return stepDone();
          });
        },
        function (stepDone) {
          connection.streams.create(streamToTrashChildMerge, function (error, stream) {
            if (error) {
              return stepDone(error);
            }
            streamToTrashChildMerge = stream;
            return stepDone();
          });
        },
        function (stepDone) {
          connection.streams.create(streamToTrashNoMerge1, function (error, stream) {
            if (error) {
              return stepDone(error);
            }
            streamToTrashNoMerge1 = stream;
            return stepDone();
          });
        },
        function (stepDone) {
          connection.streams.create(streamToTrashNoMerge2, function (error, stream) {
            if (error) {
              return stepDone(error);
            }
            streamToTrashNoMerge2 = stream;
            return stepDone();
          });
        },
        function (stepDone) {
          eventToMerge.streamId = streamToTrashChildMerge.id;
          connection.events.create(eventToMerge, function (error, event) {
            if (error) {
              return stepDone(error);
            }
            eventToMerge = event;
            return stepDone();
          });
        },
        function (stepDone) {
          streamToTrashChildMerge.trashed = true;
          connection.streams.update(streamToTrashChildMerge, function (error, stream) {
            if (error) {
              return stepDone(error);
            }
            streamToTrashChildMerge = stream;
            return stepDone();
          });
        },
        function (stepDone) {
          eventNoMerge1.streamId = streamToTrashNoMerge1.id;
          connection.events.create(eventNoMerge1, function (error, event) {
            if (error) {
              return stepDone(error);
            }
            eventNoMerge1 = event;
            return stepDone();
          });
        },
        function (stepDone) {
          eventNoMerge2.streamId = streamToTrashNoMerge2.id;
          connection.events.create(eventNoMerge2, function (error, event) {
            if (error) {
              return stepDone(error);
            }
            eventNoMerge2 = event;
            return stepDone();
          });
        },
        function (stepDone) {
          streamToTrashNoMerge2.trashed = true;
          connection.streams.update(streamToTrashNoMerge2, function (error, stream) {
            if (error) {
              return stepDone(error);
            }
            streamToTrashNoMerge2 = stream;
            return stepDone();
          });
        }
      ], done);
    });


    it('must accept a stream-like object and return a Stream object flagged as trashed',
      function (done) {
        connection.streams.delete({id: streamToTrashSimple1.id}, function (error, updatedStream) {
          should.not.exist(error);
          should.exist(updatedStream);
          updatedStream.trashed.should.eql(true);
          done();
        });
      });

    it('must return null when deleting an already-trashed stream', function (done) {
      connection.streams.delete({id: streamToTrashSimple2.id}, function (error, updatedStream) {
        should.not.exist(updatedStream);
        should.not.exist(error);
        done();
      });
    });

    it('must accept a stream id', function (done) {
      connection.streams.delete(streamToTrashNoMerge1.id, function (error, updatedStream) {
        should.not.exist(error);
        should.exist(updatedStream);
        updatedStream.trashed.should.eql(true);
        done();
      });
    });

    it('must delete linked events by default when deleting an already-trashed stream');

    it('must not merge linked events into the parent stream when specified');

    it('must merge linked events into the parent stream when specified');

    it('must return an error when the specified stream does not exist', function (done) {
      connection.streams.delete('1234', function (error, updatedStream) {
        should.exist(error);
        should.not.exist(updatedStream);
        done();
      });
    });
  });
});
