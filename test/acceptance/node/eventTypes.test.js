/* global describe, it, before, after */
var should = require('should'),
    eventTypes = require('../../../source/eventTypes.js'),
    replay = require('replay');

describe('eventTypes', function () {

  // TODO: enable replay
  before(function () {
    replay.mode = 'bloody';
  });
  after(function () {
    replay.mode = process.env.REPLAY || 'replay';
  });

  describe('flat()', function () {
    it('should return the content schema for the given type', function (done) {
      var schema = eventTypes.flat('mass/kg');
      should.exist(schema);
      schema.type.should.equal('number');
      done();
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
    it('should return extra info for the given type', function (done) {
      var info = eventTypes.extras('mass/kg');
      should.exist(info);
      info.symbol.should.equal('Kg');
      done();
    });
  });

  describe('loadExtras()', function () {
    it('should load extras from the live master and return the result', function (done) {
      eventTypes.loadExtras(function (err, result) {
        should.not.exist(err);
        should.exist(result.extras);
        result.extras['mass/kg'].symbol.should.equal('Kg');
        done();
      });
    });
  });

  describe('isNumerical()', function () {
    it('should work for event-like data', function (done) {
      eventTypes.isNumerical({type: 'time/h'}).should.equal(true);
      done();
    });

    it('should work for events type strings', function (done) {
      eventTypes.isNumerical('mass/kg').should.equal(true);
      done();
    });

    it('should tell non-numerical types', function (done) {
      eventTypes.isNumerical('note/txt').should.equal(false);
      done();
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
