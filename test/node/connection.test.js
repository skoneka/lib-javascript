/* global describe, it */
var Pryv = require('../../source/main'),
    should = require('should'),
    nock = require('nock'),
  responses = require('../data/responses.js');

describe('Connection', function () {

  var username = 'test-user',
      auth = 'test-token';
  var settings = {
    port: 443,
    ssl: true,
    domain: 'test.io'
  };
  var generatedConnectionId = 'https://test-user.test.io:443/?auth=test-token';


  var generatedShortId = 'test-user:pryv-explorer';

  var connection = new Pryv.Connection(username, auth, settings);
  var serialId = 'C' +  (Pryv.Connection._serialCounter - 1);


  describe('connection id generation', function () {


    it('should return correct url', function (done) {
      connection.id.should.equal(generatedConnectionId);
      done();
    });

  });

  describe('serialId', function () {

    it('should exists', function (done) {
      connection.serialId.should.equal(serialId);
      done();
    });

  });

  describe('displayId with connection not initialized', function () {

    it('should throw error', function (done) {
      var displayId = null;
      var catchedError = null;
      try {
        displayId = connection.displayId;
      } catch (error) {
        catchedError = error;
      }
      should.exist(catchedError);
      should.not.exist(displayId);
      done();
    });

  });

  describe('accessInfo()', function () {

    it('should call the proper API method', function (done) {
      nock('https://' + username + '.' + settings.domain)
        .get('/access-info')
        .reply(200, responses.accessInfo, responses.headersAccessInfo);
      var requestTime = (new Date()).getTime();
      connection.accessInfo(function (err, result) {
        var responseTime =  (new Date()).getTime();

        should.not.exist(err);
        should.exist(result);
        result.should.eql(responses.accessInfo);

        connection.serverInfos.deltaTime.should.be.within(1, 1.2);
        connection.serverInfos.apiVersion.should.equal('nock nock');
        connection.serverInfos.lastSeenLT.should.be.within(requestTime, responseTime);
        done();
      });
    });

  });

  describe('displayId with connection initialized', function () {

    it('should not throw error', function (done) {
      var displayId = null;
      var catchedError = null;
      try {
        displayId = connection.displayId;
      } catch (error) {
        catchedError = error;
      }
      should.not.exist(catchedError);
      displayId.should.equal(generatedShortId);
      done();
    });

  });

  describe('get*Times()', function () {

    it('getLocalTime getServerTime', function (done) { 

      var serverTime = 0;
      var localTime = connection.getLocalTime(serverTime);
      connection.getServerTime(localTime).should.equal(serverTime);


      connection.getServerTime().should.be.approximately(
        connection.getServerTime((new Date()).getTime()), 0.001
      );

      done();
    });


  });

});
