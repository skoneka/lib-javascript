/* global describe, it */

var should = require('should'),
  eventTypes = require('../../../source/eventTypes.js');

describe('eventTypes', function () {


  describe('get files', function () {
    this.timeout(20000);

    it('hierarchical', function (done) {
      var catchedErr = null;
      try {
        eventTypes.hierarchical();
      } catch (e) {
        catchedErr = e;
      }
      should.exist(catchedErr);
      eventTypes.loadHierarchical(function (error, result) {
        should.exists(result.classes.activity.formats.plain);
        done();
      });
    });

    it('extras', function (done) {
      var catchedErr = null;
      try {
        eventTypes.extras('mass/kg');
      } catch (e) {
        catchedErr = e;
      }
      should.exist(catchedErr);
      eventTypes.loadExtras(function (error, result) {
        should.exists(result.sets);
        var info = eventTypes.extras('mass/kg');
        info.symbol.should.equal('Kg');
        done();
      });
    });


    it('flat', function (done) {
      var catchedErr = null;
      try {
        eventTypes.flat('activity/pryv');
      } catch (e) {
        catchedErr = e;
      }
      should.exist(catchedErr);
      eventTypes.loadFlat(function (error, result) {
        should.exists(result);
        var info = eventTypes.flat('mass/kg');
        info.type.should.equal('number');
        done();
      });
    });



  });


});
