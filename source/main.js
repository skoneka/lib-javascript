/**
 * @class Pryv
 * @constructor
 */
function Pryv() { }

Pryv.prototype.Connection = require('./Connection.js');
Pryv.prototype.Event = require('./Event.js');
Pryv.prototype.Stream = require('./Stream.js');
Pryv.prototype.Filter = require('./Filter.js');
Pryv.prototype.System = require('./system/System.js');
Pryv.prototype.access = require('./access/access.js');
Pryv.prototype.Utility = require('./utility/Utility.js');
Pryv.prototype.Messages = require('./Messages.js');

Pryv.prototype.eventTypes = require('./eventTypes.js');

Object.defineProperty(Pryv.prototype, 'Access', {
  get: function () {
    console.log('WARNING : Pryv.Access is deprecated, use Pryv.access');
    return this.access;
  }
});


module.exports = new Pryv();
