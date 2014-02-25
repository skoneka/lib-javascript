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
      port: 443,
      ssl: true,
      domain: 'test.io'
    },
    connection = new pryv.Connection(username, auth, settings);


  if (preFetchStructure) {
    before(function (done) {
      nock('https://' + username + '.' + settings.domain)
        .get('/access-info')
        .reply(200, responses.accessInfo, responses.headersAccessInfo);


      nock('https://' + username + '.' + settings.domain)
        .get('/streams?state=all')
        .reply(200, responses.streams);

      connection.fetchStructure(function (error) {
        should.not.exist(error);
        done();
      });
    });
  }


  describe('Event ' + localEnabledStr, function () {


    var eventData =  {streamId: 'ArtMaceoThassilo',
      type: 'note/txt',
      content: 'test-content-1'};
    var event = new pryv.Event(connection,  eventData);
    var eventSerial = connection.serialId + '>E' + (connection._eventSerialCounter - 1);

    it('generate correct data()', function (done) {
      event.getData().streamId.should.equal(eventData.streamId);
      done();
    });


    it('serialId ', function (done) {
      event.serialId.should.equal(eventSerial);
      done();
    });
    it('should return correct preview url', function (done) {
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




};


testEvent(false);

testEvent(true);
