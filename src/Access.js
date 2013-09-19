var _ = require('underscore'),
  System = require('./system/System.js');


/**
 *
 * @param params
 * host:
 * username:
 * password:
 * appId:
 * success:
 * error:
 */
exports.getSessionId = function (pack) {
  var payload,
  headers = {},
  params = {
    username: pack.username,
    password: pack.password,
    appId: pack.appId
  };

  payload = JSON.stringify(params);
  headers['Content-Type'] = 'application/json; charset=utf-8';
  headers['Content-Length'] = payload.length;

  System.request({
    method : 'POST',
    host : pack.username + '.' + pack.host,
    port : 443,
    ssl : true,
    path : '/admin/login',
    headers : headers,
    payload : payload,
    //TODO: decide what callback convention to use (Node or jQuery)
    success : pack.success,
    error : pack.error
  });
};
/**
 *
 * @param pack
 */
exports.getAccesses = function (pack) {
  var headers =  { 'authorization': pack.sessionId };
  System.request({
    method : 'GET',
    host : pack.host,
    port : 443,
    ssl : true,
    path : '/admin/accesses',
    headers : headers,
    //TODO: decide what callback convention to use (Node or jQuery)
    success : pack.success,
    error : pack.error
  });
};