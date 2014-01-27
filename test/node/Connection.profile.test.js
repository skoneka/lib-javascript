/* global before, describe, it */

var Pryv = require('../../source/main'),
  should = require('should');

// !! Monitor tests are made online

var testProfile = function (preFetchStructure) {

  var localEnabledStr = preFetchStructure ? ' + LocalStorage' : '';

  describe('Profile' + localEnabledStr, function () {
    this.timeout(15000);
    var username = 'perkikiki',
      authPublic = 'TTZycvBTiq',
      authPrivate = 'chqtixz79001xdawkob8zvgg2',
      connectionPublic = new Pryv.Connection(username, authPublic, {staging: true}),
      connectionPrivate = new Pryv.Connection(username, authPrivate, {staging: true});

    if (preFetchStructure) {
      before(function (done) {
        connectionPublic.fetchStructure(function (error) {
          should.not.exist(error);
          done();
        });
        connectionPrivate.fetchStructure(function (error) {
          should.not.exist(error);
          done();
        });
      });
    }

    it('conn.profile.setPublic()', function (done) {
      connectionPublic.profile.setPublic({test1 : 'testA', test2: null}, function (error) {
        should.not.exist(error);
        done();
      });
    });

    it('conn.profile.setPrivate()', function (done) {
      connectionPrivate.profile.setPrivate({test1 : 'testA', test2: null}, function (error) {
        should.not.exist(error);
        done();
      });
    });

    it('conn.profile.getPublic(null)', function (done) {
      connectionPublic.profile.getPublic(null, function (error, result) {
        console.log(result);
        should.not.exist(error);
        result.test1.should.equal('testA');
        should.not.exist(result.test2);
        done();
      });
    });

    it('conn.profile.getPrivate(null)', function (done) {
      connectionPrivate.profile.getPrivate(null, function (error, result) {
        console.log(result);
        should.not.exist(error);
        result.test1.should.equal('testA');
        should.not.exist(result.test2);
        done();
      });
    });

    it('conn.profile.getPublic(key)', function (done) {
      connectionPublic.profile.getPublic('test1', function (error, result) {
        should.not.exist(error);
        result.should.equal('testA');
        done();
      });
    });

    it('conn.profile.getPrivate(key)', function (done) {
      connectionPrivate.profile.getPrivate('test1', function (error, result) {
        should.not.exist(error);
        result.should.equal('testA');
        done();
      });
    });

  });

};

testProfile(false);

