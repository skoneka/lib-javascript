/* global before, describe, it */

var Pryv = require('../../source/main'),
    should = require('should'),
    nock = require('nock'),
    _ = require('underscore'),
    responses = require('../data/responses.js');

var testStreams = function (enableLocalStorage) {

  var localEnabledStr = enableLocalStorage ? ' + LocalStorage' : '';

  describe('Connection.streams' + localEnabledStr, function () {
    var username = 'test-user',
      auth = 'test-token',
      settings = {
        port: 443,
        ssl: true,
        domain: 'test.io'
      },
      connection = new Pryv.Connection(username, auth, settings);


    if (enableLocalStorage) {
      before(function (done) {
        nock('https://' + username + '.' + settings.domain)
          .get('/access-info')
          .reply(200, responses.accessInfo);


        nock('https://' + username + '.' + settings.domain)
          .get('/streams?state=all')
          .reply(200, responses.streams);

        connection.useLocalStorage(function (error) {
          should.not.exist(error);
          done();
        });
      });
    }

    describe('_getData()', function () {
      var opts = {
        parentId : 'test-id',
        state : 'default',
        other : null
      };
      var response = { message : 'ok'};

      it('should call proper the proper API method', function (done) {

        nock('https://' + username + '.' + settings.domain)
          .get('/streams?parentId=test-id&state=default')
          .reply(200, response);
        connection.streams._getData(opts, function (err, result) {
          should.not.exist(err);
          should.exist(result);
          result.should.eql(response);
          done();
        });
      });

    });

    describe('get()', function () {
      var opts = null;

      if (! enableLocalStorage) {
        nock('https://' + username + '.' + settings.domain)
          .get('/streams?').times(2)  // 3 requests when no localStorage
          .reply(200, responses.streams);
      }

      it('should return an object', function (done) {

        connection.streams.get(opts, function (err, result) {
          should.not.exist(err);
          should.exist(result);

          result.should.be.instanceOf(Array);

          var countTest = 0;
          function testTree(arrayOfStreams) {
            countTest++;
            _.each(arrayOfStreams, function (stream) {
              stream.should.be.instanceOf(Pryv.Stream);
              testTree(stream.children);
            });
          }

          testTree(result);
          countTest.should.equal(38);

          done();
        });
      });

      it('walkTree should allow full view of object', function (done) {
        var count = 0;
        var order = ['PVxE_JMMzM', 'PVH-rfMJx5', 'TTks3555R5', 'VPjBRzkF8J', 'TPHz3GWTRJ'];
        connection.streams.walkTree(null, function (stream) {  // each stream
          if (order.length > count) {  // test only the firsts
            order[count].should.equal(stream.id);
          }
          count++;
        }, function (error) { // done
          should.not.exist(error);
          count.should.equal(37);
          done();
        }, this);
      });

    });

    describe('create()' + localEnabledStr, function () {
      var response = {id : 'test-id'},
          stream = {name : 'test-name'};

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

    describe('update()' + localEnabledStr, function () {
      var stream = {
        id : 'test-id',
        content : 'test-content'
      };
      var response = {message : 'ok'};

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

};

testStreams(false);

testStreams(true);
