//TODO align with XHR error

//TODO: sort out the callback convention

var FormData = require('form-data');
var _ = require('underscore');

/**
 *
 * @param {Object} pack json with
 * @param {Object} [pack.type = 'POST'] : 'GET/DELETE/POST/PUT'
 * @param {String} pack.host : fully qualified host name
 * @param {Number} pack.port : port to use
 * @param {String} pack.path : the request PATH
 * @param {Object} [pack.headers] : key / value map of headers
 * @param {Object} [pack.params] : the payload -- only with POST/PUT
 * @param {String} [pack.parseResult = 'json'] : 'text' for no parsing
 * @param {Function} pack.success : function (result, resultInfo)
 * @param {Function} pack.error : function (error, resultInfo)
 * @param {String} [pack.info] : a text
 * @param {Boolean} [pack.async = true]
 * @param {Number} [pack.expectedStatus] : http result code
 * @param {Boolean} [pack.ssl = true]
 */
module.exports = function (pack)  {


  var httpOptions = {
    host: pack.host,
    port: pack.port,
    path: pack.path,
    method: pack.method,
    rejectUnauthorized: false,
    headers : pack.headers
  };


  var parseResult = pack.parseResult || 'json';
  var httpMode = pack.ssl ? 'https' : 'http';
  var http = require(httpMode);

  if (pack.payload instanceof FormData) {
    httpOptions.method = 'post';
    _.extend(httpOptions.headers, pack.payload.getHeaders());
  } else {
    if (pack.payload) {
      pack.headers['Content-Length'] = Buffer.byteLength(pack.payload, 'utf-8');
    }
  }

  var req = http.request(httpOptions, function (res) {
    var bodyarr = [];
    res.on('data', function (chunk) {  bodyarr.push(chunk); });
    res.on('end', function () {
      var resultInfo = {
        code : res.statusCode,
        headers : res.headers
      };
      var result = null;
      if (parseResult === 'json') {
        try {
          result = JSON.parse(bodyarr.join(''));
        } catch (error) {
          return onError('request failed to parse JSON in response' +
            bodyarr.join('')
          );
        }
      }
      return pack.success(result, resultInfo);
    });

  });


  var detail = 'Request: ' + httpOptions.method + ' ' +
    httpMode + '://' + httpOptions.host + ':' + httpOptions.port + '' + httpOptions.path;



  var onError = function (reason) {
    return pack.error(reason + '\n' + detail, null);
  };

  req.on('error', function (e) {
    return onError('Error: ' + e.message);
  });


  req.on('socket', function (socket) {
    socket.setTimeout(5000);
    socket.on('timeout', function () {
      req.abort();
      return pack.error('Timeout');
    });
  });


  if (pack.payload instanceof FormData) {
    pack.payload.pipe(req);
  } else {

    if (pack.payload) {
      req.write(pack.payload, 'utf8');
    }
  }
  req.end();

  return req;
};
