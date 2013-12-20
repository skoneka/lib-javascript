/* global before, describe, it */
var Pryv = require('../../source/main'),
  utility = require('../../source/utility/utility'),
  nock = require('nock'),
  should = require('should'),
  _ = require('underscore'),
  responses = require('../data/responses.js');


var testEvents = function (preFetchStructure) {

  var localEnabledStr = preFetchStructure ? ' + LocalStorage' : '';

  var username = 'test-user',
    auth = 'test-token',
    defaultFilter = new Pryv.Filter();

  describe('Connection.events' + localEnabledStr, function () {


    var settings = {
      port: 443,
      ssl: true,
      domain: 'test.io'
    };
    var response = {message : 'ok'};

    var connection = new Pryv.Connection(username, auth, settings);

    if (preFetchStructure) {
      before(function (done) {
        nock('https://' + username + '.' + settings.domain)
          .get('/access-info')
          .reply(200, { type: 'app',
            name: 'diary-read-only',
            permissions: [ { streamId: 'diary', level: 'read' } ] });


        nock('https://' + username + '.' + settings.domain)
          .get('/streams?state=all')
          .reply(200, responses.streams);

        connection.fetchStructure(function (error) {
          should.not.exist(error);
          done();
        });
      });
    }


    describe('_get() ' + localEnabledStr, function () {

      it('should call the proper API method', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .get('/events?' + utility.getQueryParametersString(defaultFilter.settings))
          .reply(200, response);
        connection.events._get(defaultFilter, function (err, result) {
          should.not.exist(err);
          should.exist(result);
          result.should.eql(response);
          done();
        });
      });
    });


    describe('get() ' + localEnabledStr, function () {
      it('should get Event objects for request', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .get('/events?' + utility.getQueryParametersString(defaultFilter.settings))
          .reply(200, responses.events);
        connection.events.get(defaultFilter, function (err, result) {
          should.not.exist(err);
          should.exist(result);


          result.should.be.instanceOf(Array);

          result.length.should.equal(200);
          _.each(result, function (event) {
            event.should.be.instanceOf(Pryv.Event);
            should.exist(event.connection);

            var error = null;
            var stream = null;
            if (preFetchStructure) {
              stream = event.stream;
              stream.should.be.instanceOf(Pryv.Stream);
            } else { // stream property is not accessible
              try {
                stream = event.stream;
              } catch (e) {
                error = e;
              }
              should.exist(error);
              should.not.exist(stream);
            }
          });



          done();



        });
      });
    });


    describe('get( with a DEAD end filter) ' + localEnabledStr, function () {
      it('should get an empty list with no request', function (done) {
        var deadEndFilter = new Pryv.Filter();
        deadEndFilter.streamsIds = [];

        connection.events.get(deadEndFilter, function (err, result) {
          should.not.exist(err);
          should.exist(result);
          result.should.be.instanceOf(Array);
          result.length.should.equal(0);
          done();
        });
      });
    });


    describe('create( event )' + localEnabledStr, function () {

      var event = new Pryv.Event(
        connection, {streamId : 'diary', type : 'note/txt', content: 'hello'});

      var response = {id : 'Tet5slAP9q'};

      it('should create an event', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .post('/events')
          .reply(201, response);

        event = connection.events.create(event, function (err, resultJson) {
          should.not.exist(err);
          should.exist(resultJson);
          resultJson.id.should.eql(response.id);
          event.id.should.eql(response.id);
          done();
        });

      });

    });


    describe('create( eventData )' + localEnabledStr, function () {

      var eventData = {streamId : 'diary', type : 'note/txt', content: 'hello'};

      var response = {id : 'Tet5slAP9q'};

      it('should create an event', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .post('/events')
          .reply(201, response);

        var event = null;
        event = connection.events.create(eventData, function (err, resultJson) {
          should.not.exist(err);
          should.exist(resultJson);
          resultJson.id.should.eql(response.id);
          event.id.should.eql(response.id);
          done();
        });

      });

    });


    describe('batchWithData() ' + localEnabledStr, function () {
      var eventsData = [
        { content: 'test-content-1' },
        { content: 'test-content-2' }
      ];


      it('should add received id to the events', function (done) {

        connection.events.batchWithData(eventsData, function (err, result) {
          //console.log(result);
          should.not.exist(err);
          should.exist(result);
          result.should.be.instanceOf(Array);
          result.length.should.equal(2);
          result[0].id.should.equal('test_id0');
          done();
        }, function (events) {
          // as we can't known the tempRefIf (serialID) before
          // we create the response from the events created

          var response = {};
          var i = 0;
          _.each(events, function (event) {
            response[event.serialId] = { 'id' : 'test_id' + (i++) };
          });


          nock('https://' + username + '.' + settings.domain)
            .post('/events/batch')
            .reply(201, response);
        });
      });

    });

    describe('update() ' + localEnabledStr, function () {
      var eventId = 'test-id',
        data = {
          content: 'test-content'
        },
        response = {
          message : 'ok'
        };

      it('should call the proper API method', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .put('/events/' + eventId)
          .reply(200, response);
        connection.events._updateWithIdAndData(eventId, data, function (err, result) {
          should.not.exist(err);
          should.exist(result);
          result.should.eql(response);
          done();
        });
      });

    });
  });

};


testEvents(false);

testEvents(true);

