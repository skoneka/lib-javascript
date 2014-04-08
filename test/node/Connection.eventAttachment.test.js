/* global before, describe, it */
var pryv = require('../../source/main'),
  should = require('should'),
  fs = require('fs');


var testEvents = function () {


  var username = 'perkikiki',
    auth = 'chtr9ciwn000smzwkeuwqs3x7',
    streamId = 'libjstest';

  describe('Connection.events', function () {
    this.timeout(15000);

    var settings = {
      username: username,
      auth: auth,
      port: 443,
      ssl: true,
      domain: 'pryv.in'
    };

    var connection = new pryv.Connection(settings);

    var pictureData = fs.readFileSync(__dirname + '/../data/photo.PNG');

    before(function (done) {
      should.exist(pictureData);
      done();
    });



    it('createWithAttachment( eventData )', function (done) {

      var eventData = {streamId : streamId, type : 'picture/attached', description: 'test'};

      var formData = pryv.utility.forgeFormData('attachment0', pictureData, {
        type: 'image/png',
        filename: 'attachment0'
      });

      var event = null;
      event = connection.events.createWithAttachment(eventData, formData,
        function (err, resultJson) {
          should.not.exist(err);
          should.exist(resultJson);
          done();
        });

    });

  });

};

testEvents();

