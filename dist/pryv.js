;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
// file Pryv

function isBrowser() {
  return typeof(window) !== 'undefined';
}


var Pryv =  {
  Connection : require('./model/Connection.js'),
  System : isBrowser() ? require('./system/Browser.js') : require('./system/Node.js')
};

module.exports = Pryv;


},{"./model/Connection.js":2,"./system/Browser.js":3,"./system/Node.js":4}],2:[function(require,module,exports){
//file: connection

var Connection = function (username, auth) {
  this.username = username;
  this.auth = auth;

};

Connection.prototype = {
  username: null,
  auth: null,
  domain : 'pryv.io'
};


module.exports = Connection;

},{}],3:[function(require,module,exports){
//file: system browser

var System  = {
  httpRequest : function (pack) {

  }
};


module.exports = System;



},{}],4:[function(require,module,exports){

},{}]},{},[1])
;