/* global before, describe, it */

var Pryv = require('../../source/main'),
  nock = require('nock'),
  should = require('should'),
  responses = require('../data/responses.js');

var testEvent = function (enableLocalStorage) {

  var localEnabledStr = enableLocalStorage ? ' + LocalStorage' : '';


  var username = 'test-user',
    auth = 'test-token',
    settings = {
      port: 443,
      ssl: true,
      domain: 'test.io'
    },
    connection = new Pryv.Connection(username, auth, settings);


  if (enableLocalStorage) {
    before(function (done) {
      nock('https://' + username + '.' + settings.domain)
        .get('/access-info')
        .reply(200, responses.accessInfo);


      nock('https://' + username + '.' + settings.domain)
        .get('/streams?state=all')
        .reply(200, responses.streams);

      connection.useLocalStorage(function (error) {
        should.not.exist(error);
        done();
      });
    });
  }


  describe('Event ' + localEnabledStr, function () {


    var eventData =  {streamid: 'ArtMaceoThassilo',
      type: 'note/txt',
      content: 'test-content-1'};
    var event = new Pryv.Event(connection,  eventData);

    it('generate correct data()', function (done) {
      event.getData().streamid.should.equal(eventData.streamid);
      done();
    });




  });

};


testEvent(false);

testEvent(true);
