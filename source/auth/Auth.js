var Utility = require('../utility/Utility.js');


module.exports =  Utility.isBrowser() ?
    require('./Auth-browser.js') : require('./Auth-node.js');
