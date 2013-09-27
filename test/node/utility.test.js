/* global describe, it */

var should = require('should'),
    Utility = require('../../source/utility/Utility.js');

describe('Utility', function () {
  var params = {
    id : 'test-id',
    limit: 20,
    array: ['a-0', 'a-1'],
    opt: null
  };
  var paramsToMerge = {
    skip : 10,
    username: null
  };
  describe('getQueryParametersString()', function () {

    var validQuery = 'id=test-id&limit=20&array%5B%5D=a-0&array%5B%5D=a-1';

    it('should return valid query', function () {
      Utility.getQueryParametersString(params).should.eql(validQuery);
    });
  });

  describe('mergeAndClean()', function () {

    it('should return merged object without null value', function () {
      var res = Utility.mergeAndClean(params, paramsToMerge);
      should.exist(res);
      should.not.exist(res.opt);
      should.not.exist(res.username);
      res.id.should.eql('test-id');
      res.skip.should.eql(10);
    });
  });
});
