/* global describe, it */

var should = require('should'),
  eventTypes = require('../../source/eventTypes.js');

describe('eventTypes', function () {


  describe('get files', function () {
    this.timeout(15000);

    it('hierachical', function (done) {
      eventTypes.hierachical(function (error, result) {
        should.exists(result.classes.activity.formats.pryv);
        done();
      });
    });

    it('extras', function (done) {
      eventTypes.extras(function (error, result) {
        should.exists(result.sets);
        done();
      });
    });

    it('flat', function (done) {
      eventTypes.flat(function (error, result) {
        should.exists(result.types['activity/pryv']);
        done();
      });
    });

  });


});
