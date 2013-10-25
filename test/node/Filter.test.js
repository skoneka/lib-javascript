/* global describe, it */

var Pryv = require('../../source/main'),
    _ = require('underscore'),
  should = require('should');

describe('Filter', function () {

  it('Create a new filter with settings', function (done) {
    var settings =  {streams : ['test'], state: 'all', modifiedSince: 1};
    var filter = new Pryv.Filter(settings);

    should.exists(filter);
    filter.streamsIds[0].should.equal(settings.streams[0]);
    _.keys(filter.getData(true)).length.should.equal(3);
    _.keys(filter.getData(true, {toTime : 20})).length.should.equal(4);
    filter.timeFrameST = [0, 1];
    filter.getData().fromTime.should.equal(0);
    filter.getData().toTime.should.equal(1);

    done();
  });

  it('Compare two filters', function (done) {
    var filter1 = new Pryv.Filter();
    filter1.timeFrameST = [0, 1];

    var filter2 = new Pryv.Filter();
    filter2.timeFrameST = [0, 1];

    var comparison1 = filter1.compareToFilterData(filter2.getData());
    comparison1.timeFrame.should.equal(0);

    filter2.timeFrameST = [0, null];
    var comparison2 = filter1.compareToFilterData(filter2.getData());
    comparison2.timeFrame.should.equal(-1);

    filter2.timeFrameST = [0, 2];  // <-- last change of f2
    var comparison3 = filter1.compareToFilterData(filter2.getData());
    comparison3.timeFrame.should.equal(-1);

    filter1.timeFrameST = [1, 2];
    var comparison4 = filter1.compareToFilterData(filter2.getData());
    comparison4.timeFrame.should.equal(-1);

    filter1.timeFrameST = [null, null];
    var comparison5 = filter1.compareToFilterData(filter2.getData());
    comparison5.timeFrame.should.equal(1);

    filter2.timeFrameST = [0, 3];
    var comparison6 = filter1.compareToFilterData(filter2.getData());
    comparison6.timeFrame.should.equal(1);

    done();
  });


});

