/* global describe, it */

var should = require('should'),
  eventTypes = require('../../source/eventTypes.js');

describe('eventTypes', function () {


  describe('get files', function () {
    this.timeout(20000);
    
    it('hierachical', function (done) {
      var catchedErr = null;
      try {
        eventTypes.hierarchical();
      } catch (e) {
        catchedErr = e;
      }
      should.exist(catchedErr);
      eventTypes.loadHierarchical(function (error, result) {
        should.exists(result.classes.activity.formats.pryv);
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
        info.symbol.should.equal('kg');
        done();
      });
    });

    it('flat', function (done) {
      eventTypes.loadFlat(function (error, result) {
        should.exists(result.types['activity/pryv']);
        done();
      });
    });

  });


});
