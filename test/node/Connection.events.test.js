/* global before, describe, it */
var pryv = require('../../source/main'),
  utility = require('../../source/utility/utility'),
  nock = require('nock'),
  should = require('should'),
  _ = require('underscore'),
  responses = require('../data/responses.js');


var testEvents = function (preFetchStructure) {

  var localEnabledStr = preFetchStructure ? ' + LocalStorage' : '';

  var username = 'test-user',
    auth = 'test-token',
    defaultFilter = new pryv.Filter();

  describe('Connection.events' + localEnabledStr, function () {


    var settings = {
      username: username,
      auth: auth,
      port: 443,
      ssl: true,
      domain: 'test.io'
    };

    var connection = new pryv.Connection(settings);

    if (preFetchStructure) {
      before(function (done) {
        nock('https://' + username + '.' + settings.domain)
          .get('/access-info')
          .reply(200, { type: 'app',
            name: 'diary-read-only',
            permissions: [ { streamId: 'diary', level: 'read' } ] },
            responses.headersAccessInfo);


        nock('https://' + username + '.' + settings.domain)
          .get('/streams?state=all')
          .reply(200, responses.streams, responses.headersAccessInfo);

        connection.fetchStructure(function (error) {
          should.not.exist(error);
          done();
        });
      });
    }

    describe('get() ' + localEnabledStr, function () {
      it('should get Event objects for request', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .get('/events?' + utility.getQueryParametersString(defaultFilter.settings))
          .reply(200, responses.events, responses.headersAccessInfo);
        connection.events.get(defaultFilter, function (err, result) {
          should.not.exist(err);
          should.exist(result);


          result.should.be.instanceOf(Array);

          result.length.should.equal(200);
          _.each(result, function (event) {
            event.should.be.instanceOf(pryv.Event);
            should.exist(event.connection);

            var error = null;
            var stream = null;
            if (preFetchStructure) {
              stream = event.stream;
              stream.should.be.instanceOf(pryv.Stream);
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

    // TODO: all get() tests should be together
    describe('get( with a DEAD end filter) ' + localEnabledStr, function () {
      it('should get an empty list with no request', function (done) {
        var deadEndFilter = new pryv.Filter();
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

      var eventData = {streamId : 'diary', type : 'note/txt', content: 'hello'},
          event = new pryv.Event(connection, eventData);

      var response = {event: _.extend({id : 'Tet5slAP9q'}, eventData)};

      it('should create an event', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .post('/events')
          .reply(201, response, responses.headersAccessInfo);

        connection.events.create(event, function (err, resultEvent) {
          should.not.exist(err);
          should.exist(resultEvent);

          //test instance of Event
          //test
          resultEvent.id.should.eql(response.event.id);
          event.id.should.eql(response.event.id);
          done();
        });

      });

      it('should handle server errors', function (done) {
        nock('https://' + username + '.' + settings.domain)
            .post('/events')
            .reply(400, {error: {id: 'invalid-parameters-format', message: 'Test message'}},
             responses.headersAccessInfo);

        connection.events.create({streamId : 'diary', type : 'note/txt', content: 'hello'},
            function (err, resultEvent) {
          should.exist(err);
          should.not.exist(resultEvent);

          // TODO: check error is as expected

          done();
        });

      });

    });


    describe('create( eventData )' + localEnabledStr, function () {

      var eventData = {streamId : 'diary', type : 'note/txt', content: 'hello'};

      var response = {event: _.extend({id: 'Tet5slAP9q'}, eventData)};

      it('should create an event', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .post('/events')
          .reply(201, response, responses.headersAccessInfo);

        var event = null;
        event = connection.events.create(eventData, function (err, resultJson) {
          should.not.exist(err);
          should.exist(resultJson);
          resultJson.id.should.eql(response.event.id);
          event.id.should.eql(response.event.id);
          done();
        });

      });

    });


    describe('batchWithData() ' + localEnabledStr, function () {
      var eventsData = [
        { content: 'test-content-1'},
        { content: 'test-content-2'}
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
          // as we can't know the tempRefIf (serialID) before
          // we create the response from the events created

          var response = {results: []};
          var i = 0;

          _.each(events, function (event) {
            response.results.push({
              event: {
                content: event.content,
                id : 'test_id' + (i++)
              }
            });
          });

          nock('https://' + username + '.' + settings.domain)
            .post('/')
            .reply(200, response, responses.headersAccessInfo);
        });
      });

    });

    describe('update() ' + localEnabledStr, function () {
      var eventId = 'test-id',
        data = {
          content: 'test-content'
        },
        response = {event: _.extend({id: eventId}, data)};

      it('should call the proper API method', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .put('/events/' + eventId)
          .reply(200, response, responses.headersAccessInfo);
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

