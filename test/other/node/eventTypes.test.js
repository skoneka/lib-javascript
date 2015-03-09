/* global describe, it */

var should = require('should'),
  eventTypes = require('../../../source/eventTypes.js');

describe('eventTypes', function () {


  describe('get files', function () {
    this.timeout(20000);

    it('hierarchical', function (done) {
      var expectedErr = null;
      try {
        eventTypes.hierarchical();
      } catch (e) {
        expectedErr = e;
      }
      should.exist(expectedErr);
      eventTypes.loadHierarchical(function (err, result) {
        should.not.exist(err);
        should.exist(result.classes.activity.formats.plain);
        done();
      });
    });

    it('extras', function (done) {
      eventTypes.loadExtras(function (err, result) {
        should.not.exist(err);
        should.exist(result.sets);
        var info = eventTypes.extras('mass/kg');
        info.symbol.should.equal('Kg');
        done();
      });
    });


    it('flat', function (done) {
      eventTypes.loadFlat(function (err, result) {
        should.not.exist(err);
        should.exist(result);
        var info = eventTypes.flat('mass/kg');
        info.type.should.equal('number');
        done();
      });
    });

    it('isNumerical', function (done) {
      should.equal(true, eventTypes.isNumerical({type: 'time/h'}),
        'should work for events');
      should.equal(true, eventTypes.isNumerical('mass/kg'),
        'should work for events type strings');
      should.equal(false, eventTypes.isNumerical('note/txt'),
        'should detect not numerical value');
      done();
    });

  });


});
