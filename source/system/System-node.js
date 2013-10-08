//file: system node



//TODO: sort out the callback convention

/**
 *
 * @param pack json with
 * method : 'GET/DELETE/POST/PUT'
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
exports.request = function (pack)  {
  if (pack.payload) {
    pack.headers['Content-Length'] = pack.payload.length;
  }


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
      var resJson = {};
      try {
        resJson = JSON.parse(bodyarr.join(''));
      } catch (error) {

        return onError('System-node.request failed to parse JSON in response' +
          bodyarr.join('')
        );
      }
      return pack.success(resJson, requestInfo);
    });

  }).on('error', function (e) {
      return onError('Error: ' + e.message);
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
};
