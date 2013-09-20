
var _ = require('underscore');
/**
 *
 * @type {Function}
 * @constructor
 */
var Event = module.exports = function (connection, data) {
  this.connection = connection;
  _.extend(this, data);
};
