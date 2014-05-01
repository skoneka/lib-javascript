/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../test-support/config.js'),
  replay = require('replay');

describe('Connection.events', function () {
  this.timeout(5000);
  var connection = new Pryv.Connection(config.connectionSettings);

  before(function () {
    replay.mode = process.env.REPLAY || 'replay';
  });

  after(function () {
    replay.mode = 'bloody';
  });

  describe('get()', function () {
    it('must return the last 20 non-trashed Event objects (sorted descending) by default',
        function (done) {
      connection.events.get({}, function (error, events) {
        should.exist(events);
        events.length.should.equal(20);
        var lastTime = Number.POSITIVE_INFINITY;
        events.forEach(function (event) {
          event.time.should.not.be.above(lastTime);
          event.should.be.instanceOf(Pryv.Event);
          should.not.exist(event.trashed);
          lastTime = event.time;
        });
        done();
      });
    });

    it('must return events matching the given filter', function (done) {
      var filter = { limit: 10, types: ['note/txt'] };
      connection.events.get(filter, function (error, events) {
        events.length.should.equal(filter.limit);
        events.forEach(function (event) {
          filter.types.indexOf(event.type).should.not.equal(-1);
        });
        done();
      });
    });

    it('must return an error if the given filter contains an invalid parameter', function (done) {
      var filter = {fromTime: 'toto'};
      connection.events.get(filter, function (error, events) {
        should.exist(error);
        should.not.exist(events);
        done();
      });
    });

    it('must accept a null filter', function (done) {
      connection.events.get(null, function (error, events) {
        should.not.exist(error);
        should.exist(events);
        done();
      });
    });

    it('must return an empty array if there are no events', function (done) {
      var filter = {fromTime: 10, toTime: 11};
      connection.events.get(filter, function (error, events) {
        events.should.be.instanceOf(Array);
        events.length.should.equal(0);
        done();
      });
    });
  });

  describe('create()', function () {
    var eventData = {
      content: 'I am a test from js lib, please kill me',
      type: 'note/txt',
      streamId : 'diary'
    };

    it('must accept an event-like object and return an Event object', function (done) {
      connection.events.create(eventData, function (error, event) {
        should.not.exist(error);
        should.exist(event);
        event.should.be.instanceOf(Pryv.Event);
        done();
      });
    });

    it('must accept an array of event-like objects and return an array of Event objects');

    it('must accept attachment only with Event object');

    it('must return events with default values for unspecified properties', function (done) {
      connection.events.create(eventData, function (error, event) {
        should.exist(event.id);
        should.exist(event.time);
        should.exist(event.tags);
        should.exist(event.created);
        should.exist(event.createdBy);
        done();
      });
    });

    it('must return an error if the given event data is invalid', function (done) {
        var invalidData = {
          content: 'I am a devil event which is missing streamId',
          type: 'note/txt'
        };
        connection.events.create(invalidData, function (error, event) {
          should.exist(error);
          should.not.exist(event);
          done();
        });
      });

    // TODO: decide how to handle errors for batch request
    // when some errors occurs error callback is null and
    // the result array has an error flag (.hasError)
    it('must return an error for each invalid event (when given multiple items)');
  });

  // TODO: trash() should be renamed to "delete()"
  // (you can temporarily keep "trash()" for backwards-compat)
  describe('trash() (will be renamed to delete())', function () {
    var eventToTrash,
        eventTrashed;

    // TODO: either put that in tests themselves, or prepare all data in one "beforeEach"
    // (don't write multiple "before" for the same scope)
    before(function (done) {
      eventToTrash = {
        content: 'I am going to be trashed',
        streamId: 'diary',
        type: 'note/txt'
      };
      connection.events.create(eventToTrash, function (error, event) {
        if (error) { done(error); }
        eventToTrash = event;
        done();
      });
    });

    it('must accept an event-like object and return an Event object flagged as trashed',
        function (done) {
      connection.events.trash(eventToTrash, function (error, updatedEvent) {
        should.not.exist(error);
        should.exist(updatedEvent);
        updatedEvent.should.be.instanceOf(Pryv.Event);
        updatedEvent.trashed.should.equal(true);
        done();
      });
    });

    // TODO: same comment as above
    before(function (done) {
      eventTrashed = {
        trashed: true,
        content: 'I am going to be definitely trashed',
        streamId: 'diary',
        type: 'note/txt'
      };
      connection.events.create(eventTrashed, function (error, event) {
        if (error) {done(error); }
        eventTrashed = event;
        done();
      });
    });

    it('must return null when deleting an already-trashed event', function (done) {
      connection.events.trash(eventTrashed, function (error, updatedEvent) {
        should.not.exist(error);
        should.not.exist(updatedEvent);
        done();
      });
    });

    it('must accept an event id');

    it('must accept an array of event ids');

    it('must accept an array of Event objects');

    it('must return an error when the specified event does not exist', function (done) {
      connection.events.trash({id: 'unexistant-id-54s65df4'}, function (error, updatedEvent) {
        should.exist(error);
        should.not.exist(updatedEvent);
        done();
      });
    });
  });

  // TODO: move that above delete (trash) tests (follow consistent order: read-create-update-delete)
  describe('update()', function () {
    var eventToUpdate;

    // TODO: same comment as above
    before(function (done) {
      eventToUpdate = {content: 'I am going to be updated', streamId: 'diary', type: 'note/txt'};
      connection.events.create(eventToUpdate, function (error, event) {
        if (error) {done(error); }
        eventToUpdate = event;
        done();
      });
    });

    it('must accept an Event object and return the updated event', function (done) {
      var newContent = 'I was updated';
      eventToUpdate.content = newContent;
      connection.events.update(eventToUpdate, function (error, updatedEvent) {
        should.not.exist(error);
        should.exist(updatedEvent);
        updatedEvent.should.be.instanceOf(Pryv.Event);
        updatedEvent.content.should.equal(newContent);
        done();
      });
    });

    it('must accept an array of Event objects');

    it('must return an error if the event is invalid');
  });
});
