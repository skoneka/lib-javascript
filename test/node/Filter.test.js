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

});

