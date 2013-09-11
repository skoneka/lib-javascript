//file: system node

var socketIO = require('socket.io-client');

var System = {


  ioConnect : function (pack) {
    var httpMode = pack.ssl ? 'https' : 'http';
    var url = httpMode + '://' + pack.host + ':' + pack.port + '' +
      pack.path + '?auth=' + pack.auth + '&resource=' + pack.namespace;

    var ioConn = socketIO.connect(url, {'force new connection': true});

    ioConn.socket.on('error', function (error) {
      pack.error(new Error(error));
    });

    return ioConn;
  },


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
    var httpOptions = {
      host: pack.host,
      port: pack.port,
      path: pack.path,
      method: pack.method,
      rejectUnauthorized: false,
      headers : pack.headers
    };

    var httpMode = pack.ssl ? 'https' : 'http';
    var http = require(httpMode);



    var detail = 'Request: ' + httpOptions.method + ' ' +
      httpMode + '://' + httpOptions.host + ':' + httpOptions.port + '' + httpOptions.path;


    var onError = function (reason) {
      return pack.error(reason + '\n' + detail, null);
    };


    var req = http.request(httpOptions, function (res) {
      var bodyarr = [];
      res.on('data', function (chunk) {  bodyarr.push(chunk); });
      res.on('end', function () {
        var requestInfo = {
          code : res.statusCode,
          headers : res.headers
        };
        var resJson = JSON.parse(bodyarr.join(''));
        return pack.success(resJson, requestInfo);
      });

    }).on('error', function (e) {
        return onError('Error: ' + e.message );
      });


    req.on('socket', function (socket) {
      socket.setTimeout(5000);
      socket.on('timeout', function () {
        req.abort();
        return pack.error('Timeout');
      });
    });

    if (pack.payload) { req.write(pack.payload); }
    req.end();
  }
};

module.exports = System;