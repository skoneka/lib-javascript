//file: system browser



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
exports.request = function (pack)  {

  pack.info = pack.info || '';

  if (!pack.hasOwnProperty('async')) {
    pack.async = true;
  }

  // ------------ request TYPE
  pack.method = pack.method || 'POST';
  // method override test
  if (false && pack.method === 'DELETE') {
    pack.method = 'POST';
    pack.params =  pack.params || {};
    pack.params._method = 'DELETE';
  }

  // ------------- request HEADERS


  pack.headers = pack.headers || {};

  if (pack.method === 'POST' || pack.method === 'PUT') {// add json headers is POST or PUT
    pack.headers['Content-Type'] =
      pack.headers['Content-Type'] || 'application/json; charset=utf-8';
  //}

  //if (pack.method === 'POST') {
    if (pack.params) {
      pack.params = JSON.stringify(pack.params);
    } else {
      pack.params = pack.payload || {};
    }
  }



  // -------------- error
  pack.error = pack.error || function (error) {
    throw new Error(JSON.stringify(error, function (key, value) {
      if (value === null) { return; }
      if (value === '') { return; }
      return value;
    }, 2));
  };

  var detail = pack.info + ', req: ' + pack.method + ' ' + pack.url;

  // --------------- request
  var xhr = _initXHR(),
    httpMode = pack.ssl ? 'https://' : 'http://',
    url = pack.url || (httpMode + pack.host + pack.path);
  xhr.open(pack.method, url, pack.async);
  xhr.withCredentials = true;


  xhr.onreadystatechange = function () {
    detail += ' xhrstatus:' + xhr.statusText;
    if (xhr.readyState === 0) {
      pack.error({
        message: 'pryvXHRCall unsent',
        detail: detail,
        id: 'INTERNAL_ERROR',
        xhr: xhr
      }, pack.context);
    } else if (xhr.readyState === 4) {
      var result = null;

      try { result = JSON.parse(xhr.responseText); } catch (e) {
        return pack.error({
          message: 'Data is not JSON',
          detail: xhr.responseText + '\n' + detail,
          id: 'RESULT_NOT_JSON',
          xhr: xhr
        }, pack.context);
      }
      var requestInfo = {
        code : xhr.status,
        headers : xhr.getAllResponseHeaders()
      };
      pack.success(result, requestInfo);
    }
  };

  for (var key in pack.headers) {
    if (pack.headers.hasOwnProperty(key)) {
      xhr.setRequestHeader(key, pack.headers[key]);
    }
  }
  //--- prepare the params
  /*var sentParams = null;
  if (pack.params)  {
    try {
      sentParams = JSON.stringify(pack.params);
    } catch (e) {
      return pack.error({message: 'Parameters are not JSON', detail: 'params: '+pack.params+'\n
      '+detail, id: 'INTERNAL_ERROR', error: e}, pack.context);
    }
  }
      */
  //--- sending the request
  try {
    xhr.send(pack.params);
  } catch (e) {
    return pack.error({
      message: 'pryvXHRCall unsent',
      detail: detail,
      id: 'INTERNAL_ERROR',
      error: e
    }, pack.context);
  }
  return xhr;
};

/**
 * Method to initialize XMLHttpRequest.
 * @method _initXHR
 * @access private
 * @return object
 */
/* jshint -W117 */
var _initXHR = function () {
  var XHR = null;

  try { XHR = new XMLHttpRequest(); }
  catch (e) {
    try { XHR = new ActiveXObject('Msxml2.XMLHTTP'); }
    catch (e2) {
      try { XHR = new ActiveXObject('Microsoft.XMLHTTP'); }
      catch (e3) {
        console.log('XMLHttpRequest implementation not found.');
      }
      console.log('XMLHttpRequest implementation not found.');
    }
    console.log('XMLHttpRequest implementation not found.');
  }
  return XHR;
};





