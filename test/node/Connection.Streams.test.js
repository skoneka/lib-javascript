/* global before, describe, it */

var Pryv = require('../../source/main'),
  should = require('should'),
  nock = require('nock'),
  _ = require('underscore');


var testStreams = function (enableLocalStorage) {

  var localEnabledStr = enableLocalStorage ? ' + LocalStorage' : '';

  describe('Pryv.streams' + localEnabledStr, function () {
    var username = 'test-user',
      auth = 'test-token',
      settings = {
        port: 443,
        ssl: true,
        domain: 'test.io'
      },
      connection = Pryv.Connection(username, auth, settings);

    var responseAccessInfo = JSON.parse(
      '[{"clientData":{"col":"#7AEABF","color":"color_3","colorClass":"color3"},"name":"Journal",' +
        '"parentId":null,"id":"diary","children":[{"clientData":{"color":"color_3_0"},' +
        '"name":"Notes","parentId":"diary","id":"notes","children":[]},' +
        '{"clientData":{"color":"color_3_1"},"name":"Twitter","parentId":"diary",' +
        '"id":"social-twitter","children":[]},{"clientData":{"color":"color_3_2"},'  +
        '"name":"Withings","parentId":"diary","id":"health-withings","children":[]},' +
        '{"clientData":{"color":"color_3_3"},"name":"a","parentId":"diary",' +
        '"id":"Pe1mzKxmK5","children":[]}]}]');


    if (enableLocalStorage) {
      before(function (done) {

        nock('https://' + username + '.' + settings.domain)
          .get('/access-info')
          .reply(200, { type: 'app',
            name: 'diary-read-only',
            permissions: [ { streamId: 'diary', level: 'read' } ] });


        nock('https://' + username + '.' + settings.domain)
          .get('/streams?state=all')
          .reply(200, responseAccessInfo);

        connection.useLocalStorage(function (error) {
          should.not.exist(error);
          done();
        });
      });
    }


    describe('_getData', function () {
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
        connection.streams._getData(opts, function (err, result) {
          should.not.exist(err);
          should.exist(result);
          result.should.eql(response);
          done();
        });
      });
    });


    describe('get', function () {
      var opts = null;


      if (! enableLocalStorage) {
        nock('https://' + username + '.' + settings.domain)
          .get('/streams?').times(2)  // 3 requests when no localStorage
          .reply(200, responseAccessInfo);
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
          countTest.should.equal(6);

          done();
        });
      });




      it('walkTree should allow full view of object', function (done) {
        var count = 0;
        var order = ['diary', 'notes', 'social-twitter', 'health-withings', 'Pe1mzKxmK5'];
        connection.streams.walkTree(null, function (stream) {  // each stream
          order[count].should.equal(stream.id);
          count++;
        }, function (error) { // done
          should.not.exist(error);
          count.should.equal(5);
          done();
        }, this);

      });


    });





    describe('Pryv.streams CREATE' + localEnabledStr, function () {

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


    describe('Pryv.streams UPDATE' + localEnabledStr, function () {
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

};

testStreams(false);

testStreams(true);
