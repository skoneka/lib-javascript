//TODO: consider merging system into utility

var utility = require('../utility/utility.js');


var socketIO = require('socket.io-client');


var system =
  module.exports =  utility.isBrowser() ?
    require('./system-browser.js') : require('./system-node.js');

system.ioConnect = function (settings) {
  var httpMode = settings.ssl ? 'https' : 'http';
  var url = httpMode + '://' + settings.host + ':' + settings.port + '' +
    settings.path + '?auth=' + settings.auth + '&resource=' + settings.namespace;

  return socketIO.connect(url, {'force new connection': true});
};

