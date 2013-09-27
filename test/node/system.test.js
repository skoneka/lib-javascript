/*global require, describe, it */
var System = require('../../source/main').System,
    nock =   require('nock');

describe('System', function () {
  var testPack = {
    type : 'GET',
    host : 'test.com',
    port : 443,
    path : '/aPath',
    headers : '',
    payload : '',
    success : function () { return true; },
    error : function ()  { return false; },
    info : '',
    async : true,
    expectedStatus : '',
    ssl : true
  };
  var validData = {
    id: 'abc-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'mail@example.com'
  };

  describe('request()', function () {

    it('should return valid data', function (done) {
      this.timeout(0);
      nock('https://' + testPack.host)
        .get(testPack.path)
        .reply(200, validData);
      testPack.success = function (data, request) {
        data.should.eql(validData);
        request.code.should.eql(200);
        done();
      };
      System.request(testPack);
    });

  });

});

