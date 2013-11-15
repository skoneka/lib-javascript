/* global before, describe, it */

var Pryv = require('../../source/main'),
  should = require('should');

// !! Monitor tests are made online

var testProfile = function (preFetchStructure) {

  var localEnabledStr = preFetchStructure ? ' + LocalStorage' : '';

  describe('Profile' + localEnabledStr, function () {
    this.timeout(15000);
    var username = 'perkikiki',
      auth = 'TTZycvBTiq',
      connection = new Pryv.Connection(username, auth, {staging: true});


    if (preFetchStructure) {
      before(function (done) {
        connection.fetchStructure(function (error) {
          should.not.exist(error);
          done();
        });
      });
    }

    it('conn.profile.set()', function (done) {
      connection.profile.set({test1 : 'testA', test2: null}, function (error) {
        should.not.exist(error);
        done();
      });
    });

    it('conn.profile.get(null)', function (done) {
      connection.profile.get(null, function (error, result) {
        console.log(result);
        should.not.exist(error);
        result.test1.should.equal('testA');
        should.not.exist(result.test2);
        done();
      });
    });

    it('conn.profile.get(key)', function (done) {
      connection.profile.get('test1', function (error, result) {
        should.not.exist(error);
        result.should.equal('testA');
        done();
      });
    });

  });

};

testProfile(false);

