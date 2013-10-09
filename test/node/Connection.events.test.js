/* global before, describe, it */
var Pryv = require('../../source/main'),
  Utility = require('../../source/utility/Utility'),
  nock = require('nock'),
  should = require('should'),
  _ = require('underscore'),
  responses = require('../data/responses.js');


var testEvents = function (enableLocalStorage) {

  var localEnabledStr = enableLocalStorage ? ' + LocalStorage' : '';

  describe('Connection.events' + localEnabledStr, function () {

    var username = 'test-user',
      auth = 'test-token',
      defaultFilter = Pryv.Filter();
    var settings = {
      port: 443,
      ssl: true,
      domain: 'test.io'
    };
    var response = {message : 'ok'};

    var connection = new Pryv.Connection(username, auth, settings);

    if (enableLocalStorage) {
      before(function (done) {
        nock('https://' + username + '.' + settings.domain)
          .get('/access-info')
          .reply(200, { type: 'app',
            name: 'diary-read-only',
            permissions: [ { streamId: 'diary', level: 'read' } ] });


        nock('https://' + username + '.' + settings.domain)
          .get('/streams?state=all')
          .reply(200, responses.streams);

        connection.useLocalStorage(function (error) {
          should.not.exist(error);
          done();
        });
      });
    }


    describe('_get() ' + localEnabledStr, function () {

      it('should call the proper API method', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .get('/events?' + Utility.getQueryParametersString(defaultFilter.settings))
          .reply(200, response);
        connection.events._get(defaultFilter, null, function (err, result) {
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
          .get('/events?' + Utility.getQueryParametersString(defaultFilter.settings))
          .reply(200, responses.events);
        connection.events.get(defaultFilter, null, function (err, result) {
          should.not.exist(err);
          should.exist(result);


          result.should.be.instanceOf(Array);

          result.length.should.equal(200);
          _.each(result, function (event) {
            event.should.be.instanceOf(Pryv.Event);
            should.exist(event.connection);

            var error = null;
            var stream = null;
            if (enableLocalStorage) {
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


    describe('create( eventData )' + localEnabledStr, function () {

      var eventData = new Pryv.Event(
        connection, {streamId : 'diary', type : 'note/txt', content: 'hello'});

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


    describe('batch() ' + localEnabledStr, function () {
      var events = [
        { content: 'test-content-1' },
        { content: 'test-content-2' }
      ];
      response = {
        'temp_ref_id_0' : { 'id' : 'test_id_0'},
        'temp_ref_id_1' : { 'id' : 'test_id_1'}
      };

      it('should call the proper API method', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .post('/events/batch')
          .reply(201, response);
        connection.events.batch(events, function (err, result) {
          should.not.exist(err);
          should.exist(result);
          result.should.eql(response);
          done();
        });
      });

      it('should add received id to the events', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .post('/events/batch')
          .reply(200, response);
        connection.events.batch(events, function (err, result) {
          events[0].tempRefId.should.eql('temp_ref_id_0');
          events[1].tempRefId.should.eql('temp_ref_id_1');
          events[0].id.should.eql('test_id_0');
          events[1].id.should.eql('test_id_1');
          should.not.exist(err);
          should.exist(result);
          result.should.eql(response);
          done();
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
        connection.events.updateWithIdAndData(eventId, data, function (err, result) {
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

