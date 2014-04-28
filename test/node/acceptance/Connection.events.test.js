/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../../data/config.js'),
  replay = require('replay');
replay.mode = 'bloody';

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
    it('must return an array of the last 20 non-trashed Events object' +
      ' (sorted descending) by default',
      function (done) {
        connection.events.get({}, function (error, events) {
          should.exist(events);
          events.length.should.equal(20);
          var lastTime = Number.POSITIVE_INFINITY;
          events.forEach(function (event) {
            (lastTime >= event.time).should.equal(true);
            event.should.be.instanceOf(Pryv.Event);
            should.not.exist(event.trashed);
            lastTime = event.time;
          });
          done();
        });
      });
    it('must return events matching the given filter',
      function (done) {
        var filter = {limit: 10, types: ['note/txt']};
        connection.events.get(filter, function (error, events) {
          events.length.should.equal(filter.limit);
          events.forEach(function (event) {
            filter.types.indexOf(event.type).should.not.equal(-1);
          });
          done();
        });
      });
    it('must return an error if the given filter had unvalid parameter',
      function (done) {
        var filter = {fromTime: 'toto'};
        connection.events.get(filter, function (error, result) {
          should.exist(error);
          should.not.exist(result);
          done();
        });
      });
    it('must accept null filter', function (done) {
      connection.events.get(null, function (error, result) {
        should.not.exist(error);
        should.exist(result);
        done();
      });
    });
    it('must return an empty array if there are no events', function (done) {
      var filter = {fromTime: 10, toTime: 11};
      connection.events.get(filter, function (error, result) {
        result.should.be.instanceOf(Array);
        result.length.should.equal(0);
        done();
      });
    });
  });

  describe('create()', function () {
    var event = {content: 'I am a test from js lib, please kill me',
      type: 'note/txt', streamId : 'diary'};
    it('must accept an event like object and return an Event object',
      function (done) {
        connection.events.create(event, function (error, result) {
          should.not.exist(error);
          should.exist(result);
          result.should.be.instanceOf(Pryv.Event);
          done();
        });
      });
    it('must accept an array of events like object and return an Event array');
    it('must accept attachment only with Event object');
    it('must return Events with complementary properties and id',
      function (done) {
        connection.events.create(event, function (error, result) {
          should.exist(result.id);
          should.exist(result.time);
          should.exist(result.createdBy);
          done();
        });
      });
    it('must return an error when an unvalid event is given',
      function (done) {
        var unvalidEvent = {content: 'I am a devil event which is missing streamId',
          type: 'note/txt'};
        connection.events.create(unvalidEvent, function (error, result) {
          should.exist(error);
          should.not.exist(result);
          done();
        });
      });
    // TODO: decide how to handle errors for batch request
    // when some errors occurs error callback is null and
    // the result array has an error flag (.hasError)
    it('must return an error for each unvalid events given');
  });

  describe('trash()', function () {
    var eventToTrash, eventTrashed;
    before(function (done) {
      eventToTrash = {content: 'I am going to be trashed', streamId: 'diary', type: 'note/txt'};
      connection.events.create(eventToTrash, function (error, result) {
        if (error) {done(error); }
        eventToTrash = result;
        done();
      });
    });
    it('must accept an Event like object and return an Event object flaged as trashed',
      function (done) {
      connection.events.trash(eventToTrash, function (error, result) {
        should.not.exist(error);
        should.exist(result);
        result.should.be.instanceOf(Pryv.Event);
        result.trashed.should.equal(true);
        done();
      });
    });

    before(function (done) {
      eventTrashed = {trashed: true, content: 'I am going to be definitely trashed',
        streamId: 'diary', type: 'note/txt'};
      connection.events.create(eventTrashed, function (error, result) {
        if (error) {done(error); }
        eventTrashed = result;
        done();
      });
    });
    it('result must be null when the event is already flaged as trashed', function (done) {
      connection.events.trash(eventTrashed, function (error, result) {
        should.not.exist(error);
        should.not.exist(result);
        done();
      });
    });
    it('must accept event id');
    it('must accept array of event id');
    it('must accept array of Event object');
    it('must return an error when event is unvalid', function (done) {
      connection.events.trash({id: 'unexistant-id-54s65df4'}, function (error, result) {
        should.exist(error);
        should.not.exist(result);
        done();
      });
    });
  });

  describe('update()', function () {
    var eventToUpdate;
    before(function (done) {
      eventToUpdate = {content: 'I am going to be updated', streamId: 'diary', type: 'note/txt'};
      connection.events.create(eventToUpdate, function (error, result) {
        if (error) {done(error); }
        eventToUpdate = result;
        done();
      });
    });
    it('must accept Event object only', function (done) {
      connection.events.update(eventToUpdate, function (error, result) {
        should.not.exist(error);
        should.exist(result);
        done();
      });
    });
    it('must return updated Event object');
    it('must accept an Array of Event object only');
    it('must return an error if event is unvalid');
  });



});