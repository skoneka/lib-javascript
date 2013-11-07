/* global before, describe, it */

var Pryv = require('../../source/main'),
  should = require('should'),
  nock = require('nock'),
  _ = require('underscore'),
  responses = require('../data/responses.js');


var testStreams = function (preFetchStructure) {

  var localEnabledStr = preFetchStructure ? ' + LocalStorage' : '';

  /**
   * Test a StreamTree
   * @param arrayOfStreams
   * @param parent
   * @param ancestors
   * @returns {number}
   */
  function testTree(arrayOfStreams, parent, ancestors) {
    var countTest = 0;
    _.each(arrayOfStreams, function (stream) {
      countTest++;
      stream.should.be.instanceOf(Pryv.Stream);   // test object type
      if (parent) {
        stream.parent.should.be.equal(parent); // test parent
      }

      // test streamID my
      var streamResult = null;
      var streamError = null;
      try {
        streamResult = stream.connection.streams.getById(stream.id);
      } catch (e) { streamError = e; }
      if (preFetchStructure) {
        streamResult.should.equal(stream);
        should.not.exists(streamError);
      } else {
        should.exists(streamError);
        should.not.exists(streamResult);
      }




      var mancestors = null; // TODO write a good ancestors check for subtree
      if (ancestors)  {
        stream.ancestors.length.should.equal(ancestors.length); // test ancestors
        for (var i = 0; i < stream.ancestors.length; i++) {
          stream.ancestors[i].should.equal(ancestors[i]);
        }
        mancestors = ancestors.slice();
        mancestors.push(stream);
      }

      countTest += testTree(stream.children, stream, mancestors);
    });
    return countTest;
  }

  describe('Connection.streams' + localEnabledStr, function () {
    var username = 'test-user',
      auth = 'test-token',
      settings = {
        port: 443,
        ssl: true,
        domain: 'test.io'
      },
      connection = new Pryv.Connection(username, auth, settings);


    if (preFetchStructure) {
      before(function (done) {
        nock('https://' + username + '.' + settings.domain)
          .get('/access-info')
          .reply(200, responses.accessInfo, responses.headersAccessInfo);


        nock('https://' + username + '.' + settings.domain)
          .get('/streams?state=all')
          .reply(200, responses.streams);

        connection.fetchStructure(function (error) {
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



    describe('get and walkTree with no arguments', function () {
      var opts = null;

      if (! preFetchStructure) {
        nock('https://' + username + '.' + settings.domain)
          .get('/streams?').times(2)  // 3 requests when no localStorage
          .reply(200, responses.streams);
      }

      it('get(): should return an root stream Tree', function (done) {

        connection.streams.get(opts, function (err, result) {
          should.not.exist(err);
          should.exist(result);

          result.should.be.instanceOf(Array);

          var countTest = testTree(result, null, []);
          countTest.should.equal(37);


          done();

          connection.streams.getDisplayTree(result); // just for code coverage

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



    describe('get({parentID = ....})', function () {

      if (! preFetchStructure) {
        nock('https://' + username + '.' + settings.domain)
          .get('/streams?parentId=PVxE_JMMzM').times(1)  // 3 requests when no localStorage
          .reply(200, responses.streams[0].children);
      }

      it('opts: parentId should return an subTree', function (done) {
        var opts = {parentId : 'PVxE_JMMzM'};
        connection.streams.get(opts, function (err, result) {
          should.not.exist(err);
          should.exist(result);

          result.should.be.instanceOf(Array);

          var countTest = testTree(result, null, null);   // no ancestors check
          countTest.should.equal(2);

          done();
        });
      });
    });


    describe('flatenTree()' + localEnabledStr, function () {

      if (! preFetchStructure) {
        nock('https://' + username + '.' + settings.domain)
          .get('/streams?').times(1)  // 3 requests when no localStorage
          .reply(200, responses.streams);
      }

      it('getFlatenTree(): should return a flat Tree', function (done) {
        var opts = null;
        connection.streams.getFlatenedObjects(opts, function (err, result) {
          should.not.exist(err);
          should.exist(result);

          result.should.be.instanceOf(Array);
          _.each(result, function (stream) {
            stream.should.be.instanceOf(Pryv.Stream);   // test object type
          });

          result.length.should.equal(37);

          done();
        });

      });

    });


    describe('_createWithData(streamData)' + localEnabledStr, function () {
      var response = {id : 'test-id'},
        streamData = {name : 'test-name'};

      it('should call proper the proper API method', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .post('/streams')
          .reply(201, response);
        connection.streams._createWithData(streamData, function (err, result) {
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
        connection.streams._createWithData(streamData, function (err, result) {
          should.exist(streamData.id);
          streamData.id.should.eql(result.id);
          done();
        });
      });

    });

    describe('_updateWithData()' + localEnabledStr, function () {
      var streamData = {
        id : 'test-id',
        content : 'test-content'
      };
      var response = {message : 'ok'};

      it('should call the proper API method', function (done) {
        nock('https://' + username + '.' + settings.domain)
          .put('/streams/' + streamData.id)
          .reply(200, response);
        connection.streams._updateWithData(streamData, function (err, result) {
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
