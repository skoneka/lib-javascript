/* global describe, it */

var Pryv = require('../../src/main'),
    should = require('should'),
    nock = require('nock');

describe('Pryv.streams', function () {
  var username = 'test-user',
  auth = 'test-token',
  settings = {
    port: 443,
    ssl: true,
    domain: 'test.io'
  },
  connection = Pryv.Connection(username, auth, settings);

  describe('get', function () {
    var opts = {
      parentId : 'test-id',
      state : 'default',
      other : null
    },
    response = { message : 'ok'};
    it('should call proper the proper API method', function (done) {

      nock('https://' + username + '.' + settings.domain)
        .get('/streams?parentId=test-id&state=default')
        .reply(200, response);
      connection.streams.get(function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.eql(response);
        done();
      }, opts);
    });
  });
  describe('create', function () {

    var response = {
      id : 'test-id'
    },
    stream = {
      name : 'test-name'
    };
    it('should call proper the proper API method', function (done) {
      nock('https://' + username + '.' + settings.domain)
        .post('/streams')
        .reply(201, response);
      connection.streams.create(stream, function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.eql(response);
        done();
      });
    });
    it('should add received id to the stream', function (done) {
      nock('https://' + username + '.' + settings.domain)
        .post('/streams')
        .reply(201, response);
      connection.streams.create(stream, function (err, result) {
        should.exist(stream.id);
        stream.id.should.eql(result.id);
        done();
      });
    });
  });
  describe('update', function () {
    var stream = {
      id : 'test-id',
      content : 'test-content'
    },
    response = {
      message : 'ok'
    };
    it('should call the proper API method', function (done) {
      nock('https://' + username + '.' + settings.domain)
        .put('/streams/' + stream.id)
        .reply(200, response);
      connection.streams.update(stream, function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.eql(response);
        done();
      });
    });
  });
});