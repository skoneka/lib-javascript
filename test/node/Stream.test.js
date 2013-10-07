/* global before, describe, it */

var Pryv = require('../../source/main'),
  nock = require('nock'),
  should = require('should'),
  responses = require('../data/responses.js');

var testStream = function (enableLocalStorage) {

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


  describe('Stream ' + localEnabledStr, function () {

    var stream = new Pryv.Stream(connection, {name: 'test', id: 'test'});
    var streamSerial = connection.serialId + '>S' + (connection._streamSerialCounter - 1);
    it('serialId', function (done) {

      stream.serialId.should.equal(streamSerial);
      done();
    });

  });

};


testStream(false);
testStream(true);
