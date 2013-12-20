/* global before, describe, it */

var Pryv = require('../../source/main'),
  should = require('should');

// !! Monitor tests are made online

var testMonitor = function (preFetchStructure) {

  var localEnabledStr = preFetchStructure ? ' + LocalStorage' : '';

  describe('Monitor' + localEnabledStr, function () {
    var username = 'perkikiki',
      auth = 'TTZycvBTiq',
      connection = new Pryv.Connection(username, auth, {staging: true});


    if (preFetchStructure) {
      before(function (done) {
        connection.fetchStructure(function (error) {
          should.not.exist(error);
          done();
        });
      });
    }

    var filter = new Pryv.Filter({limit : 20 });
    var monitor = connection.monitor(filter);

    function onStarted(events) {
      console.log('first event received :' + events.length);
    }

    function onEventsChanged(/*changes*/) {
      console.log('onEventsChanged');
    }

    function onFilterChanged(changes) {
      console.log(changes);

    }

    it('add event listeners and start', function (done) {
      monitor.addEventListener('started', onStarted);
      monitor.addEventListener('eventsChanged', onEventsChanged);
      monitor.addEventListener('filterChanged', onFilterChanged);
      monitor.start(function (error) {
        console.log('monitor started ' + error);
        done();
      });
    });

  });

};

testMonitor(false);

//testMonitor(true);
