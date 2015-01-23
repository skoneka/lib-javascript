/* global confirm, document, navigator, location, window */

var utility = require('../utility/utility.js');
var Connection = require('../Connection.js');
var _ = require('underscore');


//--------------------- access ----------//
/**
 * @class Auth (browser)
 * # Web app (Javascript)
 *
 * Obtaining an access token for your web app.
 *
 *
 * ## What you need
 *
 * * make sure you got the [initial requirements](#intro-initial-requirements) ready.
 *  * include the following script in your page:
 *  - From github:
 *  ```html
 *  <script type="text/javascript" src="//pryv.github.io/lib-javascript/latest/pryv.js"></script>
 *  ```
 *  - or the optimized CloudFront cache: (recommended)
 *  ```html
 *  <script type="text/javascript" src="//dlw0lofo79is5.cloudfront.net/lib-javascript/latest/pryv.js"></script>
 *  ```
 *  * construct a `settings` JSON object
 *  * call `Pryv.Auth.setup(settings)`
 *
 *  For a more fleshed-out example look at the source code of [http://jsfiddle.net/pryv/fr4e834p/](http://jsfiddle.net/pryv/fr4e834p/).
 *
 *  Or make your own tests from the page:
 *  [https://sw.pryv.li:2443/access/test.html](https://sw.pryv.li:2443/access/test.html)
 * */
var Auth = function () {
};


_.extend(Auth.prototype, {
  connection: null, // actual connection managed by Auth
  config: {
    // TODO: clean up this hard-coded mess and rely on the one and only Pryv URL domains reference
    registerURL: {ssl: true, host: 'reg.pryv.io'},
    registerStagingURL: {ssl: true, host: 'reg.pryv.in'},
    localDevel : false,
    sdkFullPath: 'https://dlw0lofo79is5.cloudfront.net/lib-javascript/latest'
  },
  state: null,  // actual state
  window: null,  // popup window reference (if any)
  spanButton: null, // an element on the app web page that can be controlled
  buttonHTML: '',
  onClick: {}, // functions called when button is clicked
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
Auth._init = function (i) {
  // start only if utility is loaded
  if (typeof utility === 'undefined') {
    if (i > 100) {
      throw new Error('Cannot find utility');
    }
    i++;
    return setTimeout('Auth._init(' + i + ')', 10 * i);
  }

  utility.loadExternalFiles(
    Auth.prototype.config.sdkFullPath + '/assets/buttonSigninPryv.css', 'css');

  var urlInfo = utility.urls.parseClientURL();
  console.log('detected environment: ' + urlInfo.environment);
  if (urlInfo.environment === 'staging') {
    Auth.prototype.config.registerURL = Auth.prototype.config.registerStagingURL;
  }

  console.log('init done');
};


Auth._init(1);

//--------------------- UI Content -----------//


Auth.prototype.uiSupportedLanguages = ['en', 'fr'];

Auth.prototype.uiButton = function (onClick, buttonText) {
  if (utility.supportCSS3()) {
    return '<div id="pryv-access-btn" class="pryv-access-btn-signin" data-onclick-action="' +
      onClick + '">' +
      '<a class="pryv-access-btn pryv-access-btn-pryv-access-color" href="#">' +
      '<span class="logoSignin">Y</span></a>' +
      '<a class="pryv-access-btn pryv-access-btn-pryv-access-color"  href="#"><span>' +
      buttonText + '</span></a></div>';
  } else   {
    return '<a href="#" id ="pryv-access-btn" data-onclick-action="' + onClick +
      '" class="pryv-access-btn-signinImage" ' +
      'src="' + this.config.sdkFullPath + '/assets/btnSignIn.png" >' + buttonText + '</a>';
  }
};

Auth.prototype.uiErrorButton = function () {
  var strs = {
    'en': { 'msg': 'Error :(' },
    'fr': { 'msg': 'Erreur :('}
  }[this.settings.languageCode];
  this.onClick.Error = function () {
    this.logout();
    return false;
  }.bind(this);
  return this.uiButton('Error', strs.msg);
};

Auth.prototype.uiLoadingButton = function () {
  var strs = {
    'en': { 'msg': 'Loading...' },
    'fr': { 'msg': 'Chargement...'}
  }[this.settings.languageCode];
  this.onClick.Loading = function () {
    return false;
  };
  return this.uiButton('Loading', strs.msg);

};

Auth.prototype.uiSigninButton = function () {
  var strs = {
    'en': { 'msg': 'Sign in' },
    'fr': { 'msg': 'S\'identifier' }
  }[this.settings.languageCode];
  this.onClick.Signin = function () {
    this.popupLogin();
    return false;
  }.bind(this);
  return this.uiButton('Signin', strs.msg);

};

Auth.prototype.uiConfirmLogout = function () {
  var strs = {
    'en': { 'logout': 'Sign out?'},
    'fr': { 'logout': 'Se déconnecter?'}
  }[this.settings.languageCode];

  if (confirm(strs.logout)) {
    this.logout();
  }
};

Auth.prototype.uiInButton = function (username) {
  this.onClick.In = function () {
    this.uiConfirmLogout();
    return false;
  }.bind(this);
  return this.uiButton('In', username);
};

Auth.prototype.uiRefusedButton = function (message) {
  console.log('Pryv access [REFUSED]' + message);
  var strs = {
    'en': { 'msg': 'access refused'},
    'fr': { 'msg': 'Accès refusé'}
  }[this.settings.languageCode];
  this.onClick.Refused = function () {
    this.retry();
    return false;
  }.bind(this);
  return this.uiButton('Refused', strs.msg);

};

//--------------- end of UI ------------------//


Auth.prototype.updateButton = function (html) {
  this.buttonHTML = html;
  if (! this.settings.spanButtonID) { return; }

  utility.domReady(function () {
    if (! this.spanButton) {
      var element = document.getElementById(this.settings.spanButtonID);
      if (typeof(element) === 'undefined' || element === null) {
        throw new Error('access-SDK cannot find span ID: "' +
          this.settings.spanButtonID + '"');
      } else {
        this.spanButton = element;
      }
    }
    this.spanButton.innerHTML = this.buttonHTML;
    this.spanButton.onclick = function (e) {
      e.preventDefault();
      var element = document.getElementById('pryv-access-btn');
      console.log('onClick', this.spanButton,
        element.getAttribute('data-onclick-action'));
      this.onClick[element.getAttribute('data-onclick-action')]();
    }.bind(this);
  }.bind(this));
};

Auth.prototype.internalError = function (message, jsonData) {
  this.stateChanged({id: 'INTERNAL_ERROR', message: message, data: jsonData});
};

//STATE HUB
Auth.prototype.stateChanged  = function (data) {


  if (data.id) { // error
    if (this.settings.callbacks.error) {
      this.settings.callbacks.error(data.id, data.message);
    }
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
Auth.prototype.stateInitialization = function () {
  this.state = {status : 'initialization'};
  this.updateButton(this.uiLoadingButton());
  if (this.settings.callbacks.initialization) {
    this.settings.callbacks.initialization();
  }
};

//STATE 1 Need Signin
Auth.prototype.stateNeedSignin = function () {
  this.updateButton(this.uiSigninButton());
  if (this.settings.callbacks.needSignin) {
    this.settings.callbacks.needSignin(this.state.url, this.state.poll,
      this.state.poll_rate_ms);
  }
};


//STATE 2 User logged in and authorized
Auth.prototype.stateAccepted = function () {
  if (this.cookieEnabled) {
    utility.docCookies.setItem('access_username', this.state.username, 3600);
    utility.docCookies.setItem('access_token', this.state.token, 3600);
  }
  this.updateButton(this.uiInButton(this.state.username));

  this.connection.username = this.state.username;
  this.connection.auth = this.state.token;
  if (this.settings.callbacks.accepted) {
    this.settings.callbacks.accepted(this.state.username, this.state.token, this.state.lang);
  }
  if (this.settings.callbacks.signedIn) {
    this.settings.callbacks.signedIn(this.connection, this.state.lang);
  }
};

//STATE 3 User refused
Auth.prototype.stateRefused = function () {
  this.updateButton(this.uiRefusedButton(this.state.message));
  if (this.settings.callbacks.refused) {
    this.settings.callbacks.refused('refused:' + this.state.message);
  }
};


/**
 * clear all references
 */
Auth.prototype.logout = function () {
  this.ignoreStateFromURL = true;
  if (this.cookieEnabled) {
    utility.docCookies.removeItem('access_username');
    utility.docCookies.removeItem('access_token');
  }
  this.state = null;
  if (this.settings.callbacks.accepted) {
    this.settings.callbacks.accepted(false, false, false);
  }
  if (this.settings.callbacks.signedOut) {
    this.settings.callbacks.signedOut(this.connection);
  }
  this.connection = null;
  this.setup(this.settings);
};

/**
 * clear references and try again
 */
Auth.prototype.retry = Auth.prototype.logout;




/* jshint -W101 */
// TODO: the 4 methods below belong elsewhere (e.g. static methods of Connection); original author please check with @sgoumaz

/**
 * TODO: discuss whether signature should be `(settings, callback)`
 * @param settings
 */
Auth.prototype.login = function (settings) {
  // cookies
  this.cookieEnabled = (navigator.cookieEnabled) ? true : false;
  if (typeof navigator.cookieEnabled === 'undefined' && !this.cookieEnabled) {  //if not IE4+ NS6+
    document.cookie = 'testcookie';
    this.cookieEnabled = (document.cookie.indexOf('testcookie') !== -1) ? true : false;
  }

  var urlInfo = utility.urls.parseClientURL();
  var defaultDomain = utility.urls.domains.server[urlInfo.environment];
  this.settings = settings = _.defaults(settings, {
    ssl: true,
    domain: defaultDomain
  });

  this.connection = new Connection({
    ssl: settings.ssl,
    domain: settings.domain
  });

  var pack = {
    ssl: settings.ssl,
    host: settings.username + '.' + settings.domain,
    path: '/auth/login',
    params: {
      appId : settings.appId,
      username : settings.username,
      password : settings.password
    },
    success: function (data)  {
      if (data.token) {
        if (this.cookieEnabled && settings.rememberMe) {
          utility.docCookies.setItem('access_username', settings.username, 3600);
          utility.docCookies.setItem('access_token', data.token, 3600);
          utility.docCookies.setItem('access_preferredLanguage', data.preferredLanguage, 3600);
        }
        console.log('set cookie', this.cookieEnabled, settings.rememberMe,
          utility.docCookies.getItem('access_username'),
          utility.docCookies.getItem('access_token'));
        this.connection.username = settings.username;
        this.connection.auth = data.token;
        if (typeof(this.settings.callbacks.signedIn)  === 'function') {
          this.settings.callbacks.signedIn(this.connection);
        }
      } else {
        if (typeof(this.settings.callbacks.error) === 'function') {
          this.settings.callbacks.error(data);
        }
      }
    }.bind(this),
    error: function (jsonError) {
      if (typeof(this.settings.callbacks.error) === 'function') {
        this.settings.callbacks.error(jsonError);
      }
    }.bind(this)
  };

  utility.request(pack);
};

// TODO: must be an instance member of Connection instead
Auth.prototype.trustedLogout = function () {
  var path = '/auth/logout';
  if (this.connection) {
    this.connection.request('POST', path, function (error) {
      if (error && typeof(this.settings.callbacks.error) === 'function') {
        return this.settings.callbacks.error(error);
      }
      if (!error && typeof(this.settings.callbacks.signedOut) === 'function') {
        return this.settings.callbacks.signedOut(this.connection);
      }
    }.bind(this));
  }
};

Auth.prototype.whoAmI = function (settings) {
  var urlInfo = utility.urls.parseClientURL();
  var defaultDomain = utility.urls.domains.server[urlInfo.environment];
  this.settings = settings = _.defaults(settings, {
    ssl: true,
    domain: defaultDomain
  });

  this.connection = new Connection({
    ssl: settings.ssl,
    domain: settings.domain
  });

  var pack = {
    ssl: settings.ssl,
    host: settings.username + '.' + settings.domain,
    path :  '/auth/who-am-i',
    method: 'GET',
    success : function (data)  {
      if (data.token) {
        this.connection.username = data.username;
        this.connection.auth = data.token;
        var conn = new Connection(data.username, data.token, {
          ssl: settings.ssl,
          domain: settings.domain
        });
        console.log('before access info', this.connection);
        conn.accessInfo(function (error) {
          console.log('after access info', this.connection);
          if (!error) {
            if (typeof(this.settings.callbacks.signedIn)  === 'function') {
              this.settings.callbacks.signedIn(this.connection);
            }
          } else {
            if (typeof(this.settings.callbacks.error) === 'function') {
              this.settings.callbacks.error(error);
            }
          }
        }.bind(this));

      } else {
        if (typeof(this.settings.callbacks.error) === 'function') {
          this.settings.callbacks.error(data);
        }
      }
    }.bind(this),
    error : function (jsonError) {
      if (typeof(this.settings.callbacks.error) === 'function') {
        this.settings.callbacks.error(jsonError);
      }
    }.bind(this)
  };

  utility.request(pack);
};

Auth.prototype.loginWithCookie = function (settings) {
  var urlInfo = utility.urls.parseClientURL();
  var defaultDomain = utility.urls.domains.server[urlInfo.environment];
  this.settings = settings = _.defaults(settings, {
    ssl: true,
    domain: defaultDomain
  });

  this.connection = new Connection({
    ssl: settings.ssl,
    domain: settings.domain
  });

  this.cookieEnabled = (navigator.cookieEnabled) ? true : false;
  if (typeof navigator.cookieEnabled === 'undefined' && !this.cookieEnabled) {  //if not IE4+ NS6+
    document.cookie = 'testcookie';
    this.cookieEnabled = (document.cookie.indexOf('testcookie') !== -1) ? true : false;
  }
  var cookieUserName = this.cookieEnabled ? utility.docCookies.getItem('access_username') : false;
  var cookieToken = this.cookieEnabled ? utility.docCookies.getItem('access_token') : false;
  console.log('get cookie', cookieUserName, cookieToken);
  if (cookieUserName && cookieToken) {
    this.connection.username = cookieUserName;
    this.connection.auth = cookieToken;
    if (typeof(this.settings.callbacks.signedIn) === 'function') {
      this.settings.callbacks.signedIn(this.connection);
    }
    return this.connection;
  }
  return false;
};


/**
 * Called when user needs to sign-in
 * @callback Auth~BrowserSetupNeedSignin
 * @param {string} popupUrl Url of the authentication page to present to the user
 * @param {string} pollUrl  The URL to poll regularly in the background to monitor the signin process.
 * @param {number} pollRateMs rate in millisecond of the polling to apply on pollUrl
 */


/**
 * Called when user successfully signed-in  (or sign out)
 * @callback Auth~BrowserSetupAccepted
 * @param {string} username
 * @param {string} appToken
 * @param {string} languageCode (2 characters ISO 639-1 Code)
 */

/**
 * Called when user successfully signed-in
 * @callback Auth~BrowserSetupSignedIn
 * @param {Connection} pryv connection
 * @param {string} languageCode (2 characters ISO 639-1 Code)
 */


/**
 * Called when the user refuse to grant the requested permissions.ss
 * @callback Auth~BrowserSetupRefuse
 * @param {string} reason  Technical information on how the user refused (not to be displayed).
 */

/**
 * Called when an error interupting the signup process occurs.
 * @callback Auth~BrowserSetupError
 * @param {Object} error
 * @param {string} error.id
 * @param {string} error.message
 */

/**
 *
 * Popup or URL Callback
 *
 *
 *  During the authentication process, we need to open a PrYv access web page in a separate window. This is in order to secure personal user's information.
 *
 *  This window can be opened in:
 *
 *  - A popup, leaving the actual window open behind. This should be more comfortable on desktop browsers.
 *  - In place of the actual window, the user goes thru the process and come back to the URL you set at the end of the process.
 *
 *
 *  #### * Popup
 *
 *  If you want the authorization process to take place in a popup just set the `returnURL` settings to `false`.
 *
 *  #### * Self or Auto
 *
 *  If you want the authorization process to take place in the same windows, returning to this same exact url you can use `self[extra_params]<trailer>` or `auto[extra_params]<trailer>`.
 *
 *  When the user returns to this same page, the pryv-access-sdk will parse `prYv` parameters.
 *
 *  * command
 *  - **self**: Use the current page as returnURL value
 *  - **auto**: (prefered method) Use a returnURL when a mobile or tablet browser is detected and a popupOtherwise
 *  * parameters
 *  - **&lt;trailer>**: one of `?`, a `#` or a `&`
 *  - **[extra_parms]**: Use this space (uri_encoded) as a custom payload for the returning user.
 *
 *  EXAMPLES
 *
 *  * with `https://mysite.com/page.php` as source URL.
 *  - **self#** -> `https://mysite.com/page.php#prYvkey=JDJKhadja&prYvstatus=...`
 *  - **self?** -> `https://mysite.com/page.php?prYvkey=JDJKhadja&prYvstatus=...`
 *  - **self?mycustom=A&** -> `https://mysite.com/page.php?mycustom=A&prYvkey=JDJKh...`
 *  - **auto?mobile=1&** (if mobile) -> `https://mysite.com/page.php?mobile=1&prYvkey=JD...`
 *
 *  * with `https://mysite.com/page.php?mycustom=1` as source URL.
 *  - **self&** -> `https://mysite.com/page.php?mycustom=1&prYvk...`
 *
 *  Make your own tests from the [test page](webapp.test).
 *
 *
 *  #### * Custom
 *
 *  Set the return URL to your own page such as
 *
 *  https://www.mysite.com/end-of-Pryv.Access-process.php?
 *
 *  **Attention!!** The url submitted *must* end with a `?`, a `#` or a `&`
 *  Returned status will be appended to this URL.
 *
 *
 *  #### Examples of return URL
 *
 *  * ACCEPTED
 *
 *    https://www.mysite.com/end-of-Pryv.Access-process.php?
 *    prYvkey=GSbdasjgdv&prYvstatus=ACCEPTED&prYvusername=yacinthe&prYvtoken=VVhjDJDDG
 *
 *  * REFUSED
 *
 *    https://www.mysite.com/end-of-Pryv.Access-process.php?
 *    prYvkey=GSbdasjgdv&prYvstatus=REFUSED&prYvmessage=refused+by+user
 *
 *  * ERROR
 *
 *    https://www.mysite.com/end-of-Pryv.Access-process.php?
 *    prYvkey=GSbdasjgdv&prYvstatus=ERROR&prYvid=INTERNAL_ERROR&prYvmessage=...
 *
 * @typedef {string} Auth~SetupReturnUrl
 */

/**
 *
 *
 * @param {Object} settings
 * @param {string} settings.requestingAppId` Unique. Given by PrYv identifier for this app. It will be the key for the requested set of permission after user agreement.
 * @param {string} settings.languageCode (2 characters ISO 639-1 Code): Optional. If known the current language used by the user. This will influence the signin and register interface language.
 * @param {Object} settings.requestedPermissions (object): The requested set of permissions to access user's streams.
 * @param {Auth~SetupReturnUrl} [settings.returnURL] (url or 'auto<extra>'): If you don't want (or can't have) the popup signin-process and prefer set a returnURL. This URL will be called at the en of the SIGNIN process.This provides a better user experience on mobile devices. Details: [settings.returnURL](#webapp.returnURL)
 * @param {string} [settings.spanButtonID]. The id of a `<span />` element in the DOM of your web page. Details: [settings.spanButtonID](#webapp.spanButtonID)
 * @param {Object} settings.callbacks (functionS): called on each step of the sign-in process. Most of them are optional if you decided to rely on PrYv signin Button. All are optional excepted "accepted". Details: [settings.callbacks](#webapp.callbacks)
 * @param {Function} [settings.callbacks.initialization] (function()): When the initialization process is started. You may display a "loading" animation or for the user.
 * @param {Auth~BrowserSetupNeedSignin} [settings.callbacks.needSignin] Called when user needs to sign-in
 * @param {Auth~BrowserSetupAccepted} [settings.callbacks.accepted] Called when the signin process succeed and the permissions requested a granted. It's also triggered after a logout action with `(false,false,false)` as parameters.
 * @param {Auth~BrowserSetupSignedIn} [settings.callbacks.signedIn] Alternative to **accepted** callback.
 * @param {Auth~BrowserSetupRefuse} [settings.callbacks.refused] called when the user refuse to grant the requested permissions.
 * @returns {Connection} the connection managed by Auth.. A new one is created each time setup is
 * called.
 */
Auth.prototype.setup = function (settings) {
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
    utility.getPreferredLanguage(this.uiSupportedLanguages, settings.languageCode);

  //-- returnURL
  settings.returnURL = settings.returnURL || 'auto#';
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
      returnself = utility.browserIsMobileOrTablet();
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

  if (this.config.localDevel) {
    // return url will be forced to https://l.pryv.in:4443/Auth.html
    params.localDevel = this.config.localDevel;
  }

  this.stateInitialization();
  // TODO: clean up this hard-coded mess and rely on the one and only Pryv URL domains reference
  var domain = (this.config.registerURL.host === 'reg.pryv.io') ? 'pryv.io' : 'pryv.in';

  this.connection = new Connection(null, null, {ssl: this.config.registerURL.ssl, domain: domain});
  // look if we have a returning user (document.cookie)
  var cookieUserName = this.cookieEnabled ? utility.docCookies.getItem('access_username') : false;
  var cookieToken = this.cookieEnabled ? utility.docCookies.getItem('access_token') : false;

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

    utility.request(_.extend(pack, this.config.registerURL));


  }


  return this.connection;
};

//logout the user if

//read the polling
Auth.prototype.poll = function poll() {
  if (this.pollingIsOn && this.state.poll_rate_ms) {
    // remove eventually waiting poll..
    if (this.pollingID) { clearTimeout(this.pollingID); }


    var pack = {
      path :  '/access/' + this.state.key,
      method : 'GET',
      success : function (data)  {
        this.stateChanged(data);
      }.bind(this),
      error : function (jsonError) {
        this.internalError('poll failed: ', jsonError);
      }.bind(this)
    };

    utility.request(_.extend(pack, this.config.registerURL));


    this.pollingID = setTimeout(this.poll.bind(this), this.state.poll_rate_ms);
  } else {
    console.log('stopped polling: on=' + this.pollingIsOn + ' rate:' + this.state.poll_rate_ms);
  }
};


//messaging between browser window and window.opener
Auth.prototype.popupCallBack = function (event) {
  // Do not use 'this' here !
  if (this.settings.forcePolling) { return; }
  if (event.source !== this.window) {
    console.log('popupCallBack event.source does not match Auth.window');
    return false;
  }
  console.log('from popup >>> ' + JSON.stringify(event.data));
  this.pollingIsOn = false; // if we can receive messages we stop polling
  this.stateChanged(event.data);
};



Auth.prototype.popupLogin = function popupLogin() {
  if ((! this.state) || (! this.state.url)) {
    throw new Error('Pryv Sign-In Error: NO SETUP. Please call Auth.setup() first.');
  }

  if (this.settings.returnURL) {
    location.href = this.state.url;
    return;
  }

  // start polling
  setTimeout(this.poll(), 1000);

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


  window.addEventListener('message', this.popupCallBack.bind(this), false);

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
Auth.prototype._getStatusFromURL = function () {
  var vars = {};
  window.location.href.replace(/[?#&]+prYv([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      vars[key] = value;
    });

  //TODO check validity of status

  return (vars.key) ? vars : false;
};

//util to grab parameters from url query string
Auth.prototype._cleanStatusFromURL = function () {
  return window.location.href.replace(/[?#&]+prYv([^=&]+)=([^&]*)/gi, '');
};

//-------------------- UTILS ---------------------//

module.exports = new Auth();
