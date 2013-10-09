/* global before, describe, it */

var Pryv = require('../../source/main'),
  should = require('should');

// !! Monitor tests are made online

var testMonitor = function (enableLocalStorage) {

  var localEnabledStr = enableLocalStorage ? ' + LocalStorage' : '';

  describe('Monitor' + localEnabledStr, function () {
    var username = 'perkikiki',
      auth = 'TTZycvBTiq',
      connection = (new Pryv.Connection(username, auth)).useStaging();


    if (enableLocalStorage) {
      before(function (done) {
        connection.useLocalStorage(function (error) {
          should.not.exist(error);
          done();
        });
      });
    }

    var filter = new Pryv.Filter();
    var monitor = connection.monitor(filter);


    function onLoad(/*events*/) {
      console.log('monitor loaded');
    }

    function onEventChange(/*changes*/) {
      console.log('onEventChange');
    }

    function onFilterChange(changes) {
      console.log(changes);

    }

    it('add event listeners and start', function (done) {
      monitor.addEventListener(Pryv.Messages.Monitor.ON_LOAD, onLoad);
      monitor.addEventListener(Pryv.Messages.Monitor.ON_EVENT_CHANGE, onEventChange);
      monitor.addEventListener(Pryv.Messages.Monitor.ON_FILTER_CHANGE, onFilterChange);
      // monitor.start(function (error) {
      //console.log('monitor started ' + error);
      done();
      // });
    });

  });

};

testMonitor(false);

//testMonitor(true);
