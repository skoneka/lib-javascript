//TODO: consider merging System into Utility

function isBrowser() {
  return typeof(window) !== 'undefined';
}

var socketIO = require('socket.io-client');


var System =
  module.exports =  isBrowser() ?  require('./System-browser.js') : require('./System-node.js');

System.ioConnect = function (settings) {
  var httpMode = settings.ssl ? 'https' : 'http';
  var url = httpMode + '://' + settings.host + ':' + settings.port + '' +
    settings.path + '?auth=' + settings.auth + '&resource=' + settings.namespace;

  return socketIO.connect(url, {'force new connection': true});
};

