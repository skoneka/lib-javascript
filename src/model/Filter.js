//file: connection

var Filter = function (settings) {
  this.settings = settings;

};

Filter.prototype = {
  settings : {
    state : null,
    from : null,
    to : null,
    modifiedSince : null,
    tags : null,
    streams : null
  },
  focusedOnSingleStream : function () {
    if (_.isArray(this.settings.streams) && this.settings.streams.length === 1) {
      return this.settings.streams[0];
    }
    return null;
  }

};


module.exports = Filter;
