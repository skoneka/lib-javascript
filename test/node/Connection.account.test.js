/* global describe, it */
var pryv = require('../../source/main'),
  should = require('should'),
  nock = require('nock'),
  responses = require('../data/responses.js');


describe('Account', function () {
  var username = 'toto';
  var auth = 'token';
  var password = '123456';
  var newPassword = 'abcdef';
  var wrongPassword = '11111';
  var settings = {
    username: username,
    auth: auth,
    domain: 'pryv.in'
  };
  var connection = new pryv.Connection(settings);

  describe('Change password', function () {
    it('should have no error when given password is valid', function (done) {
      nock('https://' + username + '.' + settings.domain)
        .post('/account/change-password')
        .reply(200, {}, responses.headersStandard);
      connection.account.changePassword(password, newPassword, function (error) {
        should.not.exist(error);
        done();
      });
    });
    it('should have error when given password is wrong', function (done) {
      nock('https://' + username + '.' + settings.domain)
        .post('/account/change-password')
        .reply(400, {error: {id: 'invalid-operation'}}, responses.headersStandard);
      connection.account.changePassword(password, wrongPassword, function (error) {
        should.exist(error);
        done();
      });
    });
  });
});