/* global before, describe, it */

var pryv = require('../../source/main'),
  nock = require('nock'),
  should = require('should'),
  responses = require('../data/responses.js');

var testStream = function (preFetchStructure) {

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


  describe('Stream ' + localEnabledStr, function () {

    var stream = new pryv.Stream(connection, {name: 'test', id: 'test'});
    var streamSerial = connection.serialId + '>S' + (connection._streamSerialCounter - 1);
    it('serialId', function (done) {

      stream.serialId.should.equal(streamSerial);
      done();
    });



  });



};


testStream(false);
testStream(true);
