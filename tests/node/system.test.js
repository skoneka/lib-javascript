/*global require, describe, it */
var System = require('../../src/pryv').System;


describe('System', function () {
  var testPack = {
    type : 'GET',
    host : '',
    port : 443,
    path : '',
    headers : '',
    payload : '',
    success : function () {},
    error : function ()  {},
    info : '',
    async : true,
    expectedStatus : '',
    ssl : true
  };

  describe('ioConnect()', function () {
    it('', function () {
      var test = 1;
      test.should.eql(1);
    });
  });
});

