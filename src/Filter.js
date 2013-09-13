var _ = require('lodash');

var Filter = module.exports = function (settings) {
  // Constructor new-Agnostic
  var self = this instanceof Filter ? this : Object.create(Filter.prototype);
  self.settings = _.extend({
    //TODO: set default values
    streams: null,
    tags: null,
    from: null,
    to: null,
    limit: null,
    skip: null,
    modifiedSince: null,
    state: null
  }, settings);
  return self;
};

//TODO: remove or rewrite (name & functionality unclear)
Filter.prototype.focusedOnSingleStream = function () {
  if (_.isArray(this.settings.streams) && this.settings.streams.length === 1) {
    return this.settings.streams[0];
  }
  return null;
};
