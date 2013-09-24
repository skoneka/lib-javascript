/* global describe, it */
var Pryv = require('../../src/main'),
    Utility = require('../../src/utility/Utility'),
    should = require('should'),
    nock = require('nock');

describe('Pryv.events', function () {

  var username = 'test-user',
      auth = 'test-token',
      defaultFilter = Pryv.Filter();
  var settings = {
    port: 443,
    ssl: true,
    domain: 'test.io'
  };
  var response = { message : 'ok'};

  var connection = Pryv.Connection(username, auth, settings);

  describe('_get', function () {

    it('should call the proper API method', function (done) {
      nock('https://' + username + '.' + settings.domain)
        .get('/events?' + Utility.getQueryParametersString(defaultFilter.settings))
        .reply(200, response);
      connection.events._get(defaultFilter, null, function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.eql(response);
        done();
      });
    });

  });


  describe('create', function () {

    var events = [
      { content: 'test-content-1' },
      { content: 'test-content-2' }
    ];
    response = {
      'temp_ref_id_0' : { 'id' : 'test_id_0'},
      'temp_ref_id_1' : { 'id' : 'test_id_1'}
    };
    it('should call the proper API method', function (done) {
      nock('https://' + username + '.' + settings.domain)
        .post('/events/batch')
        .reply(201, response);
      connection.events.create(events, function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.eql(response);
        done();
      });
    });
    it('should add received id to the events', function (done) {
      nock('https://' + username + '.' + settings.domain)
        .post('/events/batch')
        .reply(200, response);
      connection.events.create(events, function (err, result) {
        events[0].tempRefId.should.eql('temp_ref_id_0');
        events[1].tempRefId.should.eql('temp_ref_id_1');
        events[0].id.should.eql('test_id_0');
        events[1].id.should.eql('test_id_1');
        should.not.exist(err);
        should.exist(result);
        result.should.eql(response);
        done();
      });
    });
  });

  describe('update', function () {
    var event = {
      id : 'test-id',
      content: 'test-content'
    },
    response = {
      message : 'ok'
    };
    it('should call the proper API method', function (done) {
      nock('https://' + username + '.' + settings.domain)
        .put('/events/' + event.id)
        .reply(200, response);
      connection.events.update(event, function (err, result) {
        should.not.exist(err);
        should.exist(result);
        result.should.eql(response);
        done();
      });
    });
  });
});
