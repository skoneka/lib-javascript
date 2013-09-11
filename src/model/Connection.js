//file: connection

var _ = require('underscore');

var System = require('../system/System.js');
var Filter = require('./Filter.js');
var Stream = require('./Stream.js');
var Utility = require('../utility/Utility.js');


var ConnectionEvents = require('./connection/Events.js');

var Connection = function (userid, auth) {
  this.userid = userid;
  this.auth = auth;


  this.connectionSettings = {
    port : 443,
    ssl: true,
    domain : 'pryv.io'
  };

  this.serverInfos = {
    deltaTime : 0, // currentTime - serverTime
    apiVersion : null,
    lastSeenLT : -1
  };


  this.events = new ConnectionEvents(this);
};

Connection.prototype = {
  userid : null,
  auth : null,
  connectionSettings : {
    port : null,
    ssl: null,
    domain : null
  },
  serverInfos : {
    deltaTime : 0, // currentTime - serverTime
    apiVersion : null,
    lastSeenLT : -1
  },


  events : null, // set of call to /events in the API (initialized at build)


  streamsCache : {},

  timeServerToSystem : function (serverTimestamp) {
    return (serverTimestamp + this.serverInfos.deltaTime) * 1000;
  },

  timeSystemToServer : function (systemDate) {
    systemDate = systemDate || new Date();
    return ((systemDate.getTime() / 1000) - this.serverInfos.deltaTime);
  },


  /**
   * Monitor
   * @param filter
   * @param callback
   */
  ioMonitor: function (filter, callback) {
    var pack = {
      host : this.userid + '.' + this.connectionSettings.domain,
      port : this.connectionSettings.port,
      ssl : this.connectionSettings.ssl,
      path : '/' + this.userid,
      namespace : '/' + this.userid,
      auth : this.auth
    };

    pack.error =  function (error) {
      callback('error', error);
      console.error('Socket.io Connection failed:' + error);
    };

    var ioSocket = System.ioConnect(pack);

    ioSocket.on('connect', function () {
      callback('connect');
    });
    ioSocket.on('eventsChanged', function () {
      callback('event');
    });
  },


  /**
   *
   * @param method
   * @param path
   * @param callback
   * @param jsonData
   * @param connection
   */
  request: function (method, path, callback, jsonData) {
    var that = this;

    var headers =  { 'authorization': that.auth };

    var payload = null;
    if (jsonData) {
      payload = JSON.stringify(jsonData);
      headers['Content-Type'] = 'application/json; charset=utf-8';
      headers['Content-Length'] = payload.length;
    }

    var success = function (result, requestInfos) {
      that.serverInfos.lastSeenLT = (new Date()).getTime();
      that.serverInfos.apiVersion = requestInfos.headers['api-version'] ||
        that.serverInfos.apiVersion;
      if (_.has(requestInfos.headers, 'server-time')) {
        that.serverInfos.deltaTime = ((new Date()).getTime() / 1000) -
          requestInfos.headers['server-time'];
      }
      callback(null, result);
    };

    var error = function (error /*, requestInfo*/) {
      callback(error, null);
    };


    System.request({
      method : method,
      host : that.userid + '.' + that.connectionSettings.domain,
      port : that.connectionSettings.port,
      ssl : that.connectionSettings.ssl,
      path : path,
      headers : headers,
      payload : payload,
      success : success,
      error : error
    });
  },


  streams : {
    get : function () {
      console.log('Called');

    }
  },

  getEvents :  function (filter, callback, deltaFilter) {
    var tParams = Utility.MergeAndClean(this.settings, deltaFilter);
    var url = '/events?' + Utility.URLParametersFromJSON(tParams);
    this.request('GET', url, function (error, result) {
      callback(error, result);
    });
  }
};



module.exports = Connection;
