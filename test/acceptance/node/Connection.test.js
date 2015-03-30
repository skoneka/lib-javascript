/* global describe, it, before, after */
var //Pryv = require('../../../source/main'),
    //should = require('should'),
    //config = require('../test-support/config.js'),
    replay = require('replay');

describe('Connection', function () {

    this.timeout(20000);

    before(function () {
        replay.mode = process.env.REPLAY || 'replay';
    });

    after(function () {
        replay.mode = 'bloody';
    });

    // instantiate Connection
    describe('Connection()', function () {

        it('must construct a Connection object with the provided parameters');

        it('must return an error when constructor parameters are invalid');
    });

    describe('attachCredentials()', function () {

        it('must accept username and token credentials');
    });

    // find out if authorize and login need to be combined or left separate
    // with a before() clause on login()
    describe('authorize()', function () {

    });

    describe('login()', function () {

    });

    describe('fetchStructure()', function () {

        it('must return the streams structure');

        // TODO find fail cases
        it('must return an error message when ..?');
    });

    describe('accessInfo()', function () {

        it('must return this connection\'s access info');

        it('must return an error if the username/token are invalid');
    });

    describe('privateProfile()', function () {

        it('must return this connection\'s private profile');
    });

    describe('getLocalTime()', function () {

        it('must return the local time');
    });

    describe('getServerTime()', function () {

        it('must return the server time');
    });

    describe('monitor()', function () {

        it('must instantiate a monitor with the provided filter');

        it('must instantiate a monitor with null filter');
    });

    // do tests? do only unit tests? because its usage is already tested in other modules
    // (ConnectionEvents,ConnectionStreams, ...
    describe('request()', function () {

        it('must ');
    });

});