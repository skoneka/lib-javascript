var Pryv = require('../../src/main'),
    should = require('should'),
    nock = require('nock');

describe('Pryv.events', function () {

  var username = 'test-user',
      auth = 'test-token',
      defaultFilter = new Pryv.Filter();
  var settings = {
    port: 443,
    ssl: true,
    domain: 'test.io'
  };
  var con = new Pryv.Connection()

  describe('get', function() {

    it('should call the proper API method', function (done) {
      nock('https://' + username + '.' + settings.domain)
        .get('/events')
        .reply(200, TODO);
      con.events.get(defaultFilter, function(err, result) {
        //TODO
        done();
      });
    };

  });

});
