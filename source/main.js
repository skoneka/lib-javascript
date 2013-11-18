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
Pryv.prototype.Access = require('./Access.js');
Pryv.prototype.Utility = require('./utility/Utility.js');
Pryv.prototype.Messages = require('./Messages.js');


Pryv.prototype.eventTypes = require('./eventTypes.js');

module.exports = new Pryv();
