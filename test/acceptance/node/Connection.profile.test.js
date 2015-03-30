/* global describe, it, before, after */
var //Pryv = require('../../../source/main'),
  //should = require('should'),
  //config = require('../test-support/config.js'),
  replay = require('replay');

describe('Connection.profile', function () {

  this.timeout(20000);
  //var connection = new Pryv.Connection(config.connectionSettings);

  before(function () {
    replay.mode = process.env.REPLAY || 'replay';
  });

  after(function () {
    replay.mode = 'bloody';
  });

  describe('getPrivate()', function () {

    it('must return the user\'s private profile set');
  });

  describe('getPublic()', function () {

    it('must return the user\'s current public profile set');
  });

  describe('setPrivate()', function () {


  });

  describe('setPublic()', function () {

  });

  describe('getTimeLimits()', function () {

  });

});