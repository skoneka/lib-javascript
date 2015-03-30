/* global describe, it, before, after */
var //Pryv = require('../../../source/main'),
    //should = require('should'),
    //config = require('../test-support/config.js'),
    replay = require('replay');

describe('Connection.accesses', function () {

    this.timeout(20000);
    //var connection = new Pryv.Connection(config.connectionSettings);

    before(function () {
        replay.mode = process.env.REPLAY || 'replay';
    });

    after(function () {
        replay.mode = 'bloody';
    });

    describe('get()', function () {
        it('must return the list of connection accesses');

        it('must return an error if...');

    });

    describe('create()', function () {

        it('must return the created access');

        it('must return an error if the new access\'s parameters are invalid');

    });

    describe('update()', function () {

        it('must return the updated access');

        it('must return an error if the updated access\'s parameteres are invalid');

    });

    describe('delete()', function () {

        it('must return ');

    });


});