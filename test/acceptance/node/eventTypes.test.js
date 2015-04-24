/* global describe, it */
var should = require('should'),
    eventTypes = require('../../../source/eventTypes.js');

describe('eventTypes', function () {

  describe('flat()', function () {
    it('should return the content schema for the given type', function () {
      var schema = eventTypes.flat('mass/kg');
      should.exist(schema);
      schema.type.should.equal('number');
    });
  });

  describe('loadFlat()', function () {
    it('should load types from the live master and return the result', function (done) {
      eventTypes.loadFlat(function (err, result) {
        should.not.exist(err);
        should.exist(result.types);
        result.types['mass/kg'].type.should.equal('number');
        done();
      });
    });
  });

  describe('extras()', function () {
    it('should return extra info for the given type', function () {
      var info = eventTypes.extras('mass/kg');
      should.exist(info);
      info.symbol.should.equal('Kg');
    });
  });

  describe('loadExtras()', function () {
    it('should load extras from the live master and return the result', function (done) {
      eventTypes.loadExtras(function (err, result) {
        should.not.exist(err);
        should.exist(result.extras);
        result.extras.mass.formats.kg.symbol.should.equal('Kg');
        done();
      });
    });
  });

  describe('isNumerical()', function () {
    it('should work for event-like data', function () {
      eventTypes.isNumerical({type: 'time/h'}).should.equal(true);
    });

    it('should work for events type strings', function () {
      eventTypes.isNumerical('mass/kg').should.equal(true);
    });

    it('should tell non-numerical types', function () {
      eventTypes.isNumerical('note/txt').should.equal(false);
    });
  });

  describe('hierarchical() + loading', function () {
    it('hierarchical() should not return default data', function (done) {
      var expectedErr = null;
      try {
        eventTypes.hierarchical();
      } catch (e) {
        expectedErr = e;
      }
      should.exist(expectedErr);
      done();
    });

    it('loadHierarchical() should load data from the live master and return it', function (done) {
      eventTypes.loadHierarchical(function (err, result) {
        should.not.exist(err);
        should.exist(result.classes.activity.formats.plain);
        done();
      });
    });
  });

});
