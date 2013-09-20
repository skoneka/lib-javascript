/* global describe, it */
var Pryv = require('../../src/main'),
  Utility = require('../../src/utility/Utility'),
  should = require('should'),
  nock = require('nock');

describe('Pryv.connection', function () {

  var username = 'test-user',
    auth = 'test-token';
  var settings = {
    port: 443,
    ssl: true,
    domain: 'test.io'
  };
  var generatedConnectionId = 'https://test-user.test.io:443/?auth=test-token';

  var responseAccessInfo = JSON.parse(
    '{"type":"app","name":"pryv-sdk-macosx-example",' +
      '"permissions":[{"level":"manage","streamId":"*"}]}');
  var generatedShortId = 'test-user:pryv-sdk-macosx-example';

  var connection = Pryv.Connection(username, auth, settings);


  describe('connection id generation', function () {
    it('should return correct url', function (done) {
      connection.id.should.equal(generatedConnectionId);
      done();
    });
  });

  describe('shortID with connection not initialized', function () {
    it('should throw Error', function (done) {
      var shortId = null;
      var catchedError = null;
      try {
        shortId = connection.shortId;
      } catch (error) {
        catchedError = error;
      }
      should.exist(catchedError);
      should.not.exist(shortId);
      done();
    });
  });


  describe('access-info', function () {

    it('should call the proper API method', function (done) {
      nock('https://' + username + '.' + settings.domain)
        .get('/access-info')
        .reply(200, responseAccessInfo);
      connection.accessInfo(function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.eql(responseAccessInfo);
        done();
      });
    });

  });


  describe('shortID with connection  initialized', function () {
    it('should throw Error', function (done) {
      var shortId = null;
      var catchedError = null;
      try {
        shortId = connection.shortId;
      } catch (error) {
        catchedError = error;
      }
      should.not.exist(catchedError);
      shortId.should.equal(generatedShortId);
      done();
    });
  });

});
