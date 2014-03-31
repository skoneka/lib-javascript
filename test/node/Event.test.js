/* global before, describe, it */

var pryv = require('../../source/main'),
  nock = require('nock'),
  should = require('should'),
  responses = require('../data/responses.js');

var testEvent = function (preFetchStructure) {

  var localEnabledStr = preFetchStructure ? ' + LocalStorage' : '';


  var username = 'test-user',
    auth = 'test-token',
    settings = {
      username: username,
      auth: auth,
      port: 443,
      ssl: true,
      domain: 'test.io'
    },
    connection = new pryv.Connection(settings);




  describe('Event ' + localEnabledStr, function () {
    if (preFetchStructure) {
      before(function (done) {
        nock('https://' + username + '.' + settings.domain)
          .get('/access-info')
          .reply(200, responses.accessInfo, responses.headersAccessInfo);


        nock('https://' + username + '.' + settings.domain)
          .get('/streams?state=all')
          .reply(200, responses.streams, responses.headersAccessInfo);

        connection.fetchStructure(function (error) {
          console.log('*32');
          should.exists(connection.datastore);
          should.not.exist(error);
          done();
        });
      });
    }





    var eventData =  {streamId: 'ArtMaceoThassilo',
      type: 'note/txt',
      content: 'test-content-1'};
    var event = new pryv.Event(connection,  eventData);
    var eventSerial = connection.serialId + '>E' + (connection._eventSerialCounter - 1);


    describe('various methods', function ()  {
      it('.getData() generate correct JSONdata', function (done) {
        event.getData().streamId.should.equal(eventData.streamId);
        done();
      });


      it('.serialId is valid', function (done) {
        event.serialId.should.equal(eventSerial);
        done();
      });
      it('.getPicturePreview()  return correct preview url', function (done) {
        var id = 'foo', w = 10, h = 20;
        event.id = id;
        var url = event.getPicturePreview();
        url.should.equal('https://' + username + '.' + settings.domain +
          ':3443/events/' + id + '?auth=' + connection.auth);
        url = event.getPicturePreview(w, h);
        url.should.equal('https://' + username + '.' + settings.domain +
          ':3443/events/' + id + '?auth=' + connection.auth + '&w=' + w + '&h=' + h);
        done();
      });
    });

    describe('unicity in memory', function () {


      var event1Data = {
        streamId: 'ArtMaceoThassilo',
        type: 'note/txt',
        content: 'test-content-1',
        id: 'heidi'
      };

      var event2Data = {
        streamId: 'ArtMaceoThassilo',
        type: 'note/txt',
        content: 'test-content-2',
        id: 'heidi'
      };

      it('is respected', function (done) {
        var event1 = new pryv.Event(connection,  event1Data);
        var event2 = new pryv.Event(connection,  event2Data);
        if (preFetchStructure) {
          should.exists(connection.datastore);
          (event2 === event1).should.eql(true);
        } else {
          should.not.exists(connection.datastore);
          (event2 === event1).should.eql(false);
        }

        done();
      });


    });

  });




};


testEvent(false);

testEvent(true);
