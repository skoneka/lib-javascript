/* global document, navigator */
/* jshint -W101*/

/*
 return error, was used only by getURLContent() and  loadURLContentInElementId() but never used outside the lib
 var system = require('../system/system.js');
 */

/**
 * Browser only utils
 */
var utility = module.exports = {};

/* Regular expressions. */


/**
 * Test if hostname is a *.rec.la or pryv.li if yes. it assumes that the client
 * runs on a staging version
 */
utility.testIfStagingFromHostname = function () {
  return utility.endsWith(document.location.hostname, 'pryv.li') ||
    utility.endsWith(document.location.hostname, 'rec.la');
};

utility.getUsernameFromHostname = function () {
  var hostname = document.location.hostname.split('.'),
    recIndex = hostname.indexOf('rec'),
    pryvIndex = hostname.indexOf('pryv');
  if (recIndex <= 0 && pryvIndex <= 0) {
    console.log('getUsernameFromHostname:', 'unknown hostname:', hostname);
    return null;
  }
  var usernameIndex = pryvIndex > 0 ? pryvIndex - 1: recIndex - 1;
  if (hostname[usernameIndex].match(utility.regex.username)) {
    return hostname[usernameIndex];
  } else {
    console.log('getUsernameFromHostname:', 'invalid username:', hostname[usernameIndex]);
    return null;
  }
};

utility.getSharingsFromPath = function () {
  var username = utility.getUsernameFromHostname();
  if (!username) {
    return [];
  }
  var path = document.location.hash.split('/'),
    sharingsIndex = path.indexOf('sharings');
  if (sharingsIndex !== -1) {
    return path.splice(sharingsIndex + 1).filter(function (el) { return el.length > 0; });
  } else {
    return [];
  }

};

/**
 *  return true if browser is seen as a mobile or tablet
 *  list grabbed from https://github.com/codefuze/js-mobile-tablet-redirect/blob/master/mobile-redirect.js
 */
utility.browserIsMobileOrTablet = function () {
  return (/iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec|ipad|android 3|sch-i800|playbook|tablet|kindle|gt-p1000|sgh-t849|shw-m180s|a510|a511|a100|dell streak|silk/i.test(navigator.userAgent.toLowerCase()));
};

/**
 * Method to get the preferred language, either from desiredLanguage or from the browser settings
 * @method getPreferredLanguage
 * @param {Array} supportedLanguages an array of supported languages encoded on 2characters
 * @param {String} desiredLanguage (optional) get this language if supported
 */
utility.getPreferredLanguage = function (supportedLanguages, desiredLanguage) {
  if (desiredLanguage) {
    if (supportedLanguages.indexOf(desiredLanguage) >= 0) { return desiredLanguage; }
  }
  var lct = null;
  if (navigator.language) {
    lct = navigator.language.toLowerCase().substring(0, 2);
  } else if (navigator.userLanguage) {
    lct = navigator.userLanguage.toLowerCase().substring(0, 2);
  } else if (navigator.userAgent.indexOf('[') !== -1) {
    var start = navigator.userAgent.indexOf('[');
    var end = navigator.userAgent.indexOf(']');
    lct = navigator.userAgent.substring(start + 1, end).toLowerCase();
  }
  if (desiredLanguage) {
    if (lct.indexOf(desiredLanguage) >= 0) { return lct; }
  }

  return supportedLanguages[0];
};


/**
 * //TODO check if it's robust
 * Method to check the browser supports CSS3.
 * @method supportCSS3
 * @return boolean
 */
utility.supportCSS3 = function ()  {
  var stub = document.createElement('div'),
    testProperty = 'textShadow';

  if (testProperty in stub.style) { return true; }

  testProperty = testProperty.replace(/^[a-z]/, function (val) {
    return val.toUpperCase();
  });

  return false;
};

/**
 * Method to load external files like javascript and stylesheet. this version
 * of method only support to file types - js|javascript and css|stylesheet.
 * @method loadExternalFiles
 * @param {String} string filename
 * @param {String} type -- 'js' or 'css'
 */
utility.loadExternalFiles = function (filename, type)  {
  var tag = null;

  type = type.toLowerCase();

  if (type === 'js' || type === 'javascript') {
    tag = document.createElement('script');
    tag.setAttribute('type', 'text/javascript');
    tag.setAttribute('src', filename);
  } else if (type === 'css' || type === 'stylesheet')  {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'stylesheet');
    tag.setAttribute('type', 'text/css');
    tag.setAttribute('href', filename);
  }

  if (tag !== null || tag !== undefined) {
    document.getElementsByTagName('head')[0].appendChild(tag);
  }
};

/**
 * Get the content on an URL as a String ,
 * Mainly designed to load HTML ressources
 * @param {String} url
 * @param {Function} callBack  function(error,content,xhr)
 * @return {Object} xhr request
 */
/*  UNUSED function
utility.getURLContent = function (url, callback) {

  function onSuccess(result, xhr) {
    callback(null, result, xhr);
  }

  function onError(error) {
    callback(error, null, error.xhr);
  }

  return system.request({
    method : 'GET',
    url : url,
    parseResult : 'text',
    success: onSuccess,
    error: onError
  });
};
*/
/**
 * Load the content of a URL into a div
 * !! No error will go to the console.
 */
/*  UNUSED function
utility.loadURLContentInElementId = function (url, elementId, next) {
  next = next || function () {};
  var content = document.getElementById(elementId);
  utility.getURLContent(url,
    function (error, result) {
      content.innerHTML = result;
      next();
      if (error) {
        console.error(error);
      }
    }
  );
};
*/




/* jshint ignore:start */
/*\
 |*|
 |*|  :: cookies.js ::
 |*|
 |*|  A complete cookies reader/writer framework with full unicode support.
 |*|
 |*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
 |*|
 |*|  Syntaxes:
 |*|
 |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
 |*|  * docCookies.getItem(name)
 |*|  * docCookies.removeItem(name[, path])
 |*|  * docCookies.hasItem(name)
 |*|  * docCookies.keys()
 |*|
 \*/
utility.docCookies = {
  getItem: function (sKey) {
    if (!sKey || !this.hasItem(sKey)) { return null; }
    return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" +
      escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ?
            "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toGMTString();
          break;
      }
    }
    document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
  },
  removeItem: function (sKey, sPath) {
    if (!sKey || !this.hasItem(sKey)) { return; }
    document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
  },
  hasItem: function (sKey) {
    return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = unescape(aKeys[nIdx]); }
    return aKeys;
  }
};

/* jshint ignore:end */


//----------- DomReady ----------//


/*!
 * domready (c) Dustin Diaz 2012 - License MIT
 */

/* jshint ignore:start */
utility.domReady = function (ready) {


  var fns = [], fn, f = false,
    doc = document,
    testEl = doc.documentElement,
    hack = testEl.doScroll,
    domContentLoaded = 'DOMContentLoaded',
    addEventListener = 'addEventListener',
    onreadystatechange = 'onreadystatechange',
    readyState = 'readyState',
    loaded = /^loade|c/.test(doc[readyState]);

  function flush(f) {
    loaded = 1;
    while (f = fns.shift()) { 
      f()
    }
  }

  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
    doc.removeEventListener(domContentLoaded, fn, f);
    flush();
  }, f);


  hack && doc.attachEvent(onreadystatechange, fn = function () {
    if (/^c/.test(doc[readyState])) {
      doc.detachEvent(onreadystatechange, fn);
      flush();
    }
  });

  return (ready = hack ?
    function (fn) {
      self != top ?
        loaded ? fn() : fns.push(fn) :
        function () {
          console.log("on dom ready 2");
          try {
            testEl.doScroll('left')
          } catch (e) {
            return setTimeout(function() { ready(fn) }, 50)
          }
          fn()
        }()
    } :
    function (fn) {
      loaded ? fn() : fns.push(fn)
    })
}();

/* jshint ignore:end */


