/* global describe, it, before, after */
var Pryv = require('../../../source/main'),
  should = require('should'),
  config = require('../../data/config.js'),
  /* jshint  -W098 */
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
    it('must return the last 20 non-trashed events (sorted descending) by default',
      function (done) {
        connection.events.get({}, function (error, events) {
          should.exist(events);
          events.length.should.equal(20);
          var lastTime = Number.POSITIVE_INFINITY;
          events.forEach(function (event) {
            (lastTime >= event.time).should.equal(true);
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
        connection.events.get(filter, function (error) {
          should.exist(error);
          done();
        });
      });
    it('should accept null filter');
  });



});