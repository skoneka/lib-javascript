var Utility = require('../utility/Utility.js');


module.exports =  Utility.isBrowser() ?
    require('./Access-browser.js') : require('./Access-node.js');