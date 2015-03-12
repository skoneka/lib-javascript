/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
    should = require('should'),
    config = require('../test-support/config.js'),
    replay = require('replay'),
    _ = require('underscore');

describe('Connection.events', function () {
    this.timeout(20000);
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
                connection.events.get({}, function (err, events) {
                    should.exist(events);
                    events.length.should.equal(20);
                    var lastTime = Number.POSITIVE_INFINITY;
                    events.forEach(function (event) {
                        event.time.should.not.be.above(lastTime);
                        event.should.be.instanceOf(Pryv.Event);
                        var trashed = event.trashed ? true : false;
                        trashed.should.equal(false);
                        lastTime = event.time;
                    });
                    done();
                });
            });

        before(function (done) {
            var eventDeleted = {
                content: 'I am a deleted test event from js lib, please kill me',
                type: 'note/txt',
                streamId: 'diary'
            };
            connection.events.create(eventDeleted, function (err, event) {
                eventDeleted = event;
                done(err);
            });
            connection.events.delete(eventDeleted, function (err) {
                done(err);
            });
        });

        it('must return deleted events when the flag includeDeletions is set', function (done) {

            var filter = {limit: 100000, includeDeletions: true};
            connection.events.get(filter, function (err, events) {
                should.not.exist(err);
                should.exist(events.eventDeletions);
                done();
            });
        });

        it('must return events matching the given filter', function (done) {
            var filter = {limit: 10, types: ['note/txt']};
            connection.events.get(filter, function (err, events) {
                events.length.should.equal(filter.limit);
                events.forEach(function (event) {
                    filter.types.indexOf(event.type).should.not.equal(-1);
                });
                done();
            });
        });

        it('must return an error if the given filter contains an invalid parameter', function (done) {
            var filter = {fromTime: 'toto'};
            connection.events.get(filter, function (err, events) {
                should.exist(err);
                should.not.exist(events);
                done();
            });
        });

        it('must accept a null filter', function (done) {
            connection.events.get(null, function (err, events) {
                should.not.exist(err);
                should.exist(events);
                done();
            });
        });

        it('must return an empty array if there are no events', function (done) {
            var filter = {fromTime: 10, toTime: 11};
            connection.events.get(filter, function (err, events) {
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
            streamId: 'diary'
        };

        var eventData2 = _.clone(eventData);
        eventData2.content = 'I am the second test from js lib, please kill me too';

        var eventDataWithAttachmentOnly = new Pryv.Event(connection, {
            attachments: [{
                'id': 'ci6w6i6ux000tx2puftadoiya',
                'fileName': 'photo.jpg',
                'type': 'image/jpeg',
                'size': 2561
            }]
        });

        var eventDataSingleActivity = {streamId: 'activity', type: 'activity/plain'};

        var eventsDataArray = [eventData, eventData2];

        it('must accept an event-like object and return an Event object', function (done) {
            connection.events.create(eventData, function (err, event) {
                should.not.exist(err);
                should.exist(event);
                event.should.be.instanceOf(Pryv.Event);
                done();
            });
        });

        // COMMENT: method? if same, it should maybe be exported in its own describe() paragraph
        it('must accept an array of event-like objects and return an array of Event objects', function (done) {
            connection.events.create(eventsDataArray, function (err, eventsArray) {
                should.not.exist(err);
                should.exist(eventsArray);
                for (var e in eventsArray) {
                    e.should.be.instanceOf(Pryv.Event);
                }
                done();
            });
        });

        it('must accept attachment only with Event object', function (done) {
            connection.events.create(eventDataWithAttachmentOnly, function (err, event) {
                should.not.exist(err);
                should.exist(event);
                event.should.be.instanceOf(Pryv.Event);
                done();
            });
        });

        it('must return events with default values for unspecified properties', function (done) {
            connection.events.create(eventData, function (err, event) {
                should.exist(event.id);
                should.exist(event.time);
                should.exist(event.tags);
                should.exist(event.created);
                should.exist(event.createdBy);
                done();
            });
        });

        it('must return a stoppedId field when called in a SingleActivity stream', function (done) {
            connection.events.create(eventDataSingleActivity, function (err, event, stoppedId) {
                should.not.exist(err);
                should.exist(event);
                should.exist(stoppedId);
                done();
            });
        });

        // TODO
        it('must return a periods-overlap error when called in a singleActivity stream and durations overlap', function (done) {
            done();
        });

        it('must return an error if the given event data is invalid', function (done) {
            var invalidData = {
                content: 'I am a devil event which is missing streamId',
                type: 'note/txt'
            };
            connection.events.create(invalidData, function (err, event) {
                should.exist(err);
                should.not.exist(event);
                done();
            });
        });

        // TODO: decide how to handle errors for batch request
        // when some errors occurs error callback is null and
        // the result array has an error flag (.hasError)
        it('must return an error for each invalid event (when given multiple items)');
    });


    describe('start()', function () {

        // make sure that testing stream is singleActivity

        var eventData = {streamId: 'activity', type: 'activity/plain'};

        it('should create an event and being able to stop it', function (done) {
            connection.events.start(eventData, function (err, event) {
                should.not.exist(err);
                should.exist(event);
                should.not.exist(event.duration);
                done();
            });
        });

    });


    describe('stopEvent() ', function () {

        var eventData = {streamId: 'activity', type: 'activity/plain', description: 'A'};

        var event = null;
        before(function (done) {
            connection.events.start(eventData, function (err, evt) {
                event = evt;
                done(err);
            });
        });

        it('should stop the previously started event', function (done) {
            connection.events.stopEvent(event, null, function (err, stoppedId) {
                should.not.exist(err);
                should.exist(stoppedId);
                stoppedId.should.eql(event.id);
                done();
            });
        });

    });

    describe('stopStream()', function () {

        var eventData = {streamId: 'activity', type: 'activity/plain', description: 'B'};

        var event = null;
        before(function (done) {
            connection.events.start(eventData, function (err, evt) {
                event = evt;
                done(err);
            });
        });

        // impossible because of "request record"
        it('should stop the previously started event in this stream'/*, function (done) {
         connection.events.stopStream(
         {id: event.streamId}, null, null, function (err, stoppedId) {

         should.not.exist(err);
         should.exist(stoppedId);
         should.not.exist(event.duration);
         stoppedId.should.eql(event.id);
         done();
         });

         }*/);

    });


    // TODO: move that above delete (trash) tests (follow consistent order: read-create-update-delete)
    describe('update()', function () {
        var eventToUpdate, eventToUpdate2, arrayOfEventsToUpdate,
            eventSingleActivityToUpdate;


        // TODO: same comment as above
        beforeEach(function (done) {
            eventToUpdate = {content: 'I am going to be updated', streamId: 'diary', type: 'note/txt'};
            connection.events.create(eventToUpdate, function (err, event) {
                eventToUpdate = event;
                done(err);
            });
        });

        it('must accept an Event object and return the updated event', function (done) {
            var newContent = 'I was updated';
            eventToUpdate.content = newContent;
            connection.events.update(eventToUpdate, function (err, updatedEvent) {
                should.not.exist(err);
                should.exist(updatedEvent);
                updatedEvent.should.be.instanceOf(Pryv.Event);
                updatedEvent.content.should.equal(newContent);
                done();
            });
        });

        it('must accept an event-like object and return an Event object', function (done) {
            var newContent = 'I was updated again';
            eventToUpdate.content = newContent;
            var eventDataToUpdate = eventToUpdate.getData;
            connection.events.update(eventDataToUpdate, function (err, updatedEvent) {
                should.not.exist(err);
                should.exist(updatedEvent);
                updatedEvent.should.be.instanceOf(Pryv.Event);
                updatedEvent.content.should.equal(newContent);
                done();
            });
        });

        before(function (done) {
            eventToUpdate = {content: 'I am going to be updated', streamId: 'diary', type: 'note/txt'};
            eventToUpdate2 = {content: 'I am also going to be updated', streamId: 'diary', type: 'note/txt'};
            arrayOfEventsToUpdate = [eventToUpdate, eventToUpdate2];
            connection.events.create(arrayOfEventsToUpdate, function (err, events) {
                arrayOfEventsToUpdate = events;
                done(err);
            });
        });

        it('must accept an array of Event objects', function (done) {
            var newContent1 = 'I was updated';
            var newContent2 = 'I was also updated';
            arrayOfEventsToUpdate[0].content = newContent1;
            arrayOfEventsToUpdate[1].content = newContent2;
            connection.events.update(arrayOfEventsToUpdate, function (err, updatedEvents) {
                should.not.exist(err);
                should.exist(updatedEvents);
                for (var e in updatedEvents) {
                    if (e.id === arrayOfEventsToUpdate[0].id) {
                        e.content.should.equal(newContent1);
                    }
                    if (e.id === arrayOfEventsToUpdate[1].id) {
                        e.content.should.equal(newContent2);
                    }
                }
                done();
            });
        });

        before(function (done) {
            eventSingleActivityToUpdate = {streamId: 'activity', type: 'activity/plain'};
            connection.events.create(eventSingleActivityToUpdate, function (err, event) {
                eventSingleActivityToUpdate = event;
                done(err);
            });

        });

        it('must return a stoppedId field when called in a SingleActivity stream', function (done) {
            connection.events.update(eventSingleActivityToUpdate, function (err, event, stoppedId) {
                should.not.exist(err);
                should.exist(event);
                should.exist(stoppedId);
                done();
            });
        });

        // TODO
        it('must return a periods-overlap error when called in a singleActivity stream and durations overlap');

        before(function (done) {
            eventToUpdate = {
                content: 'I am going to be updated with invalid data',
                streamId: 'diary',
                type: 'note/txt'
            };
            connection.events.create(eventToUpdate, function (err, event) {
                eventToUpdate = event;
                done(err);
            });
        });

        it('must return an error if the event is invalid', function (done) {
            eventToUpdate.streamId = null;
            connection.events.update(eventToUpdate, function (err, event) {
                should.exist(err);
                should.not.exist(event);
                done();
            });
        });

    });


    // TODO: maybe also create addAttachmentS() method
    describe('addAttachment()'), function () {

        //var event = new Pryv.Event(connection, {});


        // TODO
        it('must accept an Attachment and return the event with the right attachment property', function (done) {
            done();

        });

        // TODO
        it('must return an error in case of invalid parameters');
    };


    describe('getAttachment()', function () {

        // TODO
        it('must accept an attachment\'s and its event\'s parameters and return the binary file contents');

        // TODO
        it('must return an error in case of invalid parameters');
    });


    describe('removeAttachment()', function () {

        // TODO
        it('must accept an attachment and return the updated event');

        // TODO
        it('must accept the eventId and fileId and return the updatedEvent');

        // TODO
        it('must return an error in case of invalid parameters');
    });


    describe('delete()', function () {
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
            connection.events.create(eventToTrash, function (err, event) {
                eventToTrash = event;
                done(err);
            });
        });

        it('must accept an event-like object and return an Event object flagged as trashed',
            function (done) {
                connection.events.delete(eventToTrash, function (err, updatedEvent) {
                    should.not.exist(err);
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
            connection.events.create(eventTrashed, function (err, event) {
                eventTrashed = event;
                done(err);
            });
        });

        it('must return null when deleting an already-trashed event', function (done) {
            connection.events.delete(eventTrashed, function (err, updatedEvent) {
                should.not.exist(err);
                should.not.exist(updatedEvent);
                done();
            });
        });

        it('must accept an event id');
        // TODO

        it('must accept an array of event ids');
        // TODO

        it('must accept an array of Event objects');
        // TODO

        it('must return an error when the specified event does not exist', function (done) {
            connection.events.delete({id: 'unexistant-id-54s65df4'}, function (err, updatedEvent) {
                should.exist(err);
                should.not.exist(updatedEvent);
                done();
            });
        });
    });

});
