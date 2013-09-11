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

  /**
   *
   * @param pack json with
   * type : 'GET/DELETE/POST/PUT'
   * host : fully qualified host name
   * port : port to use
   * path : the request PATH
   * headers : key / value map of headers
   * payload : the payload
   * success : function (result, requestInfos)
   * error : function (error, requestInfos)
   * info : a text
   * async : boolean : default (TRUE)
   * expectedStatus : code
   * ssl : boolean (default true)
   */
  request: function (pack)  {

    pack.info = pack.info || '';

    if(!pack.hasOwnProperty("async")) {
      pack.async = true;
    }

    // ------------ request TYPE
    pack.type = pack.type || 'POST';
    // method override test
    if (false && pack.type === 'DELETE') {
      pack.type = 'POST';
      pack.params =  pack.params || {};
      pack.params._method = 'DELETE';
    }

    // ------------- request HEADERS


    pack.headers = pack.headers || {};

    if (pack.type === 'POST' || pack.type === 'PUT') {// add json headers is POST or PUT
      pack.headers['Content-Type'] =
        pack.headers['Content-Type'] || 'application/json; charset=utf-8';
    }

    if (pack.type === 'POST') { pack.params = pack.params || {}; }



    // -------------- error
    pack.error = pack.error || function (error, context) {
      throw new Error(JSON.stringify(error, function (key, value) {
        if (value === null) { return; }
        if (value === '') { return; }
        return value;
      }, 2));
    };

    var detail = pack.info + ', req: ' + pack.type + ' ' + pack.url;

    // --------------- request
    var xhr = this._initXHR();

    xhr.open(pack.type, pack.url, pack.async);
    xhr.withCredentials = true;


    xhr.onreadystatechange = function () {
      detail += ' xhrstatus:' + xhr.statusText;
      if (xhr.readyState === 0) {
        pack.error({message: "pryvXHRCall unsent", detail: detail, id: "INTERNAL_ERROR", xhr: xhr}, pack.context);
      } else if (xhr.readyState === 4) {
        var result = null;

        try { result = JSON.parse(xhr.responseText); } catch (e) {
          return pack.error({message: "Data is not JSON", detail: xhr.responseText+"\n"+detail, id: "RESULT_NOT_JSON", xhr: xhr}, pack.context);
        }

        pack.success(result,pack.context,xhr);
      }
    };

    for (var key in pack.headers) {
      if (pack.headers.hasOwnProperty(key)) {
        xhr.setRequestHeader(key, pack.headers[key]);
      }
    }

    //--- prepare the params
    var sentParams = null;
    if (pack.params)  {
      try {
        sentParams = JSON.stringify(pack.params);
      } catch (e) {
        return pack.error({message: "Parameters are not JSON", detail: "params: "+pack.params+"\n "+detail, id: "INTERNAL_ERROR", error: e}, pack.context);
      }
    }

    //--- sending the request
    try {
      xhr.send(sentParams);
    } catch (e) {
      return pack.error({message: "pryvXHRCall unsent", detail: detail, id: "INTERNAL_ERROR", error: e}, pack.context);
    }
    return xhr;
  }

};


module.exports = System;



},{}],4:[function(require,module,exports){

},{}]},{},[1])
;