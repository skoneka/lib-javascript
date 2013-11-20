/* global confirm, document, navigator, location, window */

var Utility = require('../utility/Utility.js');
var System = require('../system/System.js');
var _ = require('underscore');


//--------------------- access ----------//
/**
 * @class Access
 * */
var Access = function ()  {
};

_.extend(Access, {
  config: {
    registerURL: {ssl: true, host: 'reg.pryv.io'},
    registerStagingURL: {ssl: true, host: 'reg.pryv.in'},
    localDevel : false,
    sdkFullPath: '../../dist'
  },
  state: null,  // actual state
  window: null,  // popup window reference (if any)
  spanButton: null, // an element on the app web page that can be controlled
  buttonHTML: '',
  settings: null,
  pollingID: false,
  pollingIsOn: true, //may be turned off if we can communicate between windows
  cookieEnabled: false,
  ignoreStateFromURL: false // turned to true in case of loggout
});

/**
 * Method to initialize the data required for authorization.
 * @method _init
 * @access private
 */
Access._init = function (i) {
  // start only if Utility is loaded
  if (typeof Utility === 'undefined') {
    if (i > 100) {
      throw new Error('Cannot find Utility');
    }
    i++;
    return setTimeout('Access._init(' + i + ')', 10 * i);
  }

  Utility.loadExternalFiles(
    this.config.sdkFullPath + '/media/buttonSigninPryv.css', 'css');

  if (Utility.testIfStagingFromHostname()) {
    console.log('staging mode');
    Access.config.registerURL = Access.config.registerStagingURL;
  }

  console.log('init done');
};


Access._init(1);

//--------------------- UI Content -----------//


Access.uiSupportedLanguages = ['en', 'fr'];

Access.uiButton = function (onClick, buttonText) {
  if (Utility.supportCSS3()) {
    return '<div class="pryv-access-btn-signin" onclick="' + onClick + '">' +
      '<a class="pryv-access-btn pryv-access-btn-pryv-access-color" href="#">' +
      '<span class="logoSignin">Y</span></a>' +
      '<a class="pryv-access-btn pryv-access-btn-pryv-access-color"  href="#"><span>' +
      buttonText + '</span></a></div>';
  } else   {
    return '<a href="#" onclick="' + onClick +
      '" class="pryv-access-btn-signinImage" ' +
      'src="' + this.config.sdkFullPath + '/media/btnSignIn.png" >' + buttonText + '</a>';
  }
};

Access.uiErrorButton = function () {
  var strs = {
    'en': { 'msg': 'Error :(' },
    'fr': { 'msg': 'Erreur :('}
  }[this.settings.languageCode];

  return Access.uiButton('Pryv.Access.logout(); return false;', strs.msg);

};

Access.uiLoadingButton = function () {
  var strs = {
    'en': { 'msg': 'Loading ...' },
    'fr': { 'msg': 'Chargement ...'}
  }[this.settings.languageCode];

  return Access.uiButton('return false;', strs.msg);

};

Access.uiSigninButton = function () {
  var strs = {
    'en': { 'msg': 'Pryv Sign-In' },
    'fr': { 'msg': 'Connection à PrYv'}
  }[this.settings.languageCode];

  return Access.uiButton('Pryv.Access.popupLogin(); return false;', strs.msg);

};

Access.uiConfirmLogout = function () {
  var strs = {
    'en': { 'logout': 'Logout ?'},
    'fr': { 'logout': 'Se déconnecter?'}
  }[this.settings.languageCode];

  if (confirm(strs.logout)) {
    Access.logout();
  }
};

Access.uiInButton = function (username) {
  return Access.uiButton('Pryv.Access.uiConfirmLogout(); return false;', username);
};

Access.uiRefusedButton = function (message) {
  console.log('Pryv access [REFUSED]' + message);
  var strs = {
    'en': { 'msg': 'access refused'},
    'fr': { 'msg': 'Accès refusé'}
  }[this.settings.languageCode];

  return Access.uiButton('Pryv.Access.retry(); return false;', strs.msg);

};

//--------------- end of UI ------------------//


Access.updateButton = function (html) {
  this.buttonHTML = html;
  if (! this.settings.spanButtonID) { return; }

  Utility.domReady(function () {
    if (! Access.spanButton) {
      var element = document.getElementById(Access.settings.spanButtonID);
      if (typeof(element) === 'undefined' || element === null) {
        throw new Error('access-SDK cannot find span ID: "' +
          Access.settings.spanButtonID + '"');
      } else {
        Access.spanButton = element;
      }
    }
    Access.spanButton.innerHTML = Access.buttonHTML;

  });
};

Access.internalError = function (message, jsonData) {
  Access.stateChanged({id: 'INTERNAL_ERROR', message: message, data: jsonData});
};

//STATE HUB
Access.stateChanged  = function (data) {


  if (data.id) { // error
    this.settings.callbacks.error(data.id, data.message);
    this.updateButton(this.uiErrorButton());
    console.log('Error: ' + JSON.stringify(data));
    // this.logout();   Why should I retry if it failed already once?
  }

  if (data.status === this.state.status) {
    return;
  }
  if (data.status === 'LOADED') { // skip
    return;
  }
  if (data.status === 'POPUPINIT') { // skip
    return;
  }

  this.state = data;
  if (this.state.status === 'NEED_SIGNIN') {
    this.stateNeedSignin();
  }
  if (this.state.status === 'REFUSED') {
    this.stateRefused();
  }

  if (this.state.status === 'ACCEPTED') {
    this.stateAccepted();
  }

};

//STATE 0 Init
Access.stateInitialization = function () {
  this.state = {status : 'initialization'};
  this.updateButton(this.uiLoadingButton());
  this.settings.callbacks.initialization();
};

//STATE 1 Need Signin
Access.stateNeedSignin = function () {
  this.updateButton(this.uiSigninButton());
  this.settings.callbacks.needSignin(this.state.url, this.state.poll,
    this.state.poll_rate_ms);
};


//STATE 2 User logged in and authorized
Access.stateAccepted = function () {
  if (this.cookieEnabled) {
    Utility.docCookies.setItem('access_username', this.state.username, 3600);
    Utility.docCookies.setItem('access_token', this.state.token, 3600);
  }
  this.updateButton(this.uiInButton(this.state.username));
  this.settings.callbacks.accepted(this.state.username, this.state.token, this.state.lang);
};

//STATE 3 User refused
Access.stateRefused = function () {
  this.updateButton(this.uiRefusedButton(this.state.message));
  this.settings.callbacks.refused('refused:' + this.state.message);
};


/**
 * clear all references
 */
Access.logout = function () {
  this.ignoreStateFromURL = true;
  if (this.cookieEnabled) {
    Utility.docCookies.removeItem('access_username');
    Utility.docCookies.removeItem('access_token');
  }
  this.state = null;
  this.settings.callbacks.accepted(false, false, false);
  this.setup(this.settings);
};

/**
 * clear references and try again
 */
Access.retry = Access.logout;


Access.setup = function (settings) {
  this.state = null;
  //--- check the browser capabilities


  // cookies
  this.cookieEnabled = (navigator.cookieEnabled) ? true : false;
  if (typeof navigator.cookieEnabled === 'undefined' && !this.cookieEnabled) {  //if not IE4+ NS6+
    document.cookie = 'testcookie';
    this.cookieEnabled = (document.cookie.indexOf('testcookie') !== -1) ? true : false;
  }

  //TODO check settings.. 

  settings.languageCode =
    Utility.getPreferredLanguage(this.uiSupportedLanguages, settings.languageCode);

  //-- returnURL
  if (settings.returnURL) {
    // check the trailer
    var trailer = settings.returnURL.charAt(settings.returnURL.length - 1);
    if ('#&?'.indexOf(trailer) < 0) {
      throw new Error('Pryv access: Last character of --returnURL setting-- is not ' +
        '"?", "&" or "#": ' + settings.returnURL);
    }

    // set self as return url?
    var returnself = (settings.returnURL.indexOf('self') === 0);
    if (settings.returnURL.indexOf('auto') === 0) {
      returnself = Utility.browserIsMobileOrTablet();
      if (!returnself) { settings.returnURL = false; }
    }

    if (returnself) {
      var myParams = settings.returnURL.substring(4);
      // eventually clean-up current url from previous pryv returnURL
      settings.returnURL = this._cleanStatusFromURL() + myParams;
    }

    if (settings.returnURL) {
      if (settings.returnURL.indexOf('http') < 0) {
        throw new Error('Pryv access: --returnURL setting-- does not start with http: ' +
          settings.returnURL);
      }
    }
  }

  //  spanButtonID is checked only when possible  
  this.settings = settings;

  var params = {
    requestingAppId : settings.requestingAppId,
    requestedPermissions : settings.requestedPermissions,
    languageCode : settings.languageCode,
    returnURL : settings.returnURL
  };

  if (Access.config.localDevel) {
    // return url will be forced to https://l.pryv.in:4443/Access.html
    params.localDevel = Access.config.localDevel;
  }

  this.stateInitialization();

  // look if we have a returning user (document.cookie)
  var cookieUserName = this.cookieEnabled ? Utility.docCookies.getItem('access_username') : false;
  var cookieToken = this.cookieEnabled ? Utility.docCookies.getItem('access_token') : false;

  // look in the URL if we are returning from a login process
  var stateFromURL =  this._getStatusFromURL();

  if (stateFromURL && (! this.ignoreStateFromURL)) {
    this.stateChanged(stateFromURL);
  } else if (cookieToken && cookieUserName) {
    this.stateChanged({status: 'ACCEPTED', username: cookieUserName, token: cookieToken});
  } else { // launch process $

    var pack = {
      path :  '/access',
      params : params,
      success : function (data)  {
        if (data.status && data.status !== 'ERROR') {
          this.stateChanged(data);
        } else {
          // TODO call shouldn't failed
          this.internalError('/access Invalid data: ', data);
        }
      }.bind(this),
      error : function (jsonError) {
        this.internalError('/access ajax call failed: ', jsonError);
      }.bind(this)
    };

    System.request(_.extend(pack, Access.config.registerURL));


  }
  return true;
};

//logout the user if 

//read the polling 
Access.poll = function poll() {
  if (this.pollingIsOn && this.state.poll_rate_ms) {
    // remove eventually waiting poll.. 
    if (this.pollingID) { clearTimeout(this.pollingID); }


    var pack = {
      path :  '/access/' + Access.state.key,
      method : 'GET',
      success : function (data)  {
        this.stateChanged(data);
      }.bind(this),
      error : function (jsonError) {
        this.internalError('poll failed: ', jsonError);
      }.bind(this)
    };

    System.request(_.extend(pack, Access.config.registerURL));


    this.pollingID = setTimeout(Access.poll.bind(this), this.state.poll_rate_ms);
  } else {
    console.log('stopped polling: on=' + this.pollingIsOn + ' rate:' + this.state.poll_rate_ms);
  }
};


//messaging between browser window and window.opener
Access.popupCallBack = function (event) {
  // Do not use 'this' here !
  if (Access.settings.forcePolling) { return; }
  if (event.source !== Access.window) {
    console.log('popupCallBack event.source does not match Access.window');
    return false;
  }
  console.log('from popup >>> ' + JSON.stringify(event.data));
  Access.pollingIsOn = false; // if we can receive messages we stop polling
  Access.stateChanged(event.data);
};



Access.popupLogin = function popupLogin() {
  if ((! this.state) || (! this.state.url)) {
    throw new Error('Pryv Sign-In Error: NO SETUP. Please call Access.setup() first.');
  }

  if (this.settings.returnURL) {
    location.href = this.state.url;
    return;
  }

  // start polling
  setTimeout(Access.poll(), 1000);

  var screenX = typeof window.screenX !== 'undefined' ? window.screenX : window.screenLeft,
    screenY = typeof window.screenY !== 'undefined' ? window.screenY : window.screenTop,
    outerWidth = typeof window.outerWidth !== 'undefined' ?
      window.outerWidth : document.body.clientWidth,
    outerHeight = typeof window.outerHeight !== 'undefined' ?
      window.outerHeight : (document.body.clientHeight - 22),
    width    = 270,
    height   = 420,
    left     = parseInt(screenX + ((outerWidth - width) / 2), 10),
    top      = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
    features = (
      'width=' + width +
        ',height=' + height +
        ',left=' + left +
        ',top=' + top +
        ',scrollbars=yes'
      );


  window.addEventListener('message', Access.popupCallBack, false);

  this.window = window.open(this.state.url, 'prYv Sign-in', features);

  if (! this.window) {
    // TODO try to fall back on access
    console.log('FAILED_TO_OPEN_WINDOW');
  } else {
    if (window.focus) {
      this.window.focus();
    }
  }

  return false;
};




//util to grab parameters from url query string
Access._getStatusFromURL = function () {
  var vars = {};
  window.location.href.replace(/[?#&]+prYv([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      vars[key] = value;
    });

  //TODO check validity of status

  return (vars.key) ? vars : false;
};

//util to grab parameters from url query string
Access._cleanStatusFromURL = function () {
  return window.location.href.replace(/[?#&]+prYv([^=&]+)=([^&]*)/gi, '');
};

//-------------------- UTILS ---------------------//

module.exports = Access;