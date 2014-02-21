/* global document, navigator */
/* jshint -W101*/

/**
 * Browser-only utils
 */
var utility = module.exports = {};


/**
 * Test if hostname is a *.rec.la or pryv.li if yes. it assumes that the client
 * runs on a staging version
 */
utility.testIfStagingFromUrl = function (url) {
  var location;
  if (url) {
    location = document.createElement('a');
    location.href = url;
  } else {
    location = document.location;
  }
  return utility.endsWith(location.hostname, 'pryv.li') ||
         utility.endsWith(location.hostname, 'pryv.in') ||
         utility.endsWith(location.hostname, 'rec.la');
};

utility.getUsernameFromUrl = function (url) {
  var location;
  if (url) {
    location = document.createElement('a');
    location.href = url;
  } else {
    location = document.location;
  }
  var hostname = location.hostname.split('.'),
    recIndex = hostname.indexOf('rec'),
    pryvIndex = hostname.indexOf('pryv');
  if (recIndex <= 0 && pryvIndex <= 0) {
    console.log('getUsernameFromUrl:', 'unknown hostname:', hostname);
    return null;
  }
  var usernameIndex = pryvIndex > 0 ? pryvIndex - 1: recIndex - 1;
  if (hostname[usernameIndex].match(utility.regex.username)) {
    return hostname[usernameIndex];
  } else {
    console.log('getUsernameFromUrl:', 'invalid username:', hostname[usernameIndex]);
    return null;
  }
};

utility.getSharingsFromUrl = function (url) {
  var username = utility.getUsernameFromUrl(url);
  if (!username) {
    return [];
  }
  var location;
  if (url) {
    location = document.createElement('a');
    location.href = url;
  } else {
    location = document.location;
  }
  var path = location.hash.split('/'),
    sharingsIndex = path.indexOf('sharings');
  if (sharingsIndex !== -1) {
    return path.splice(sharingsIndex + 1).filter(function (el) { return el.length > 0; });
  } else {
    return [];
  }
};

utility.getParamsFromUrl = function (url) {
  var location;
  if (url) {
    location = document.createElement('a');
    location.href = url;
  } else {
    location = document.location;
  }
  var str = location.search;
  var objURL = {};
  str.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), function ($0, $1, $2, $3) {
    objURL[$1] = $3;
  });
  return objURL;
};
utility.getPathFromUrl = function (url) {
  var location;
  if (url) {
    location = document.createElement('a');
    location.href = url;
  } else {
    location = document.location;
  }
  return location.pathname === '/' ? '' : location.pathname;
};
utility.getHostFromUrl = function (url) {
  var location;
  if (url) {
    location = document.createElement('a');
    location.href = url;
  } else {
    location = document.location;
  }
  return location.hostname;
};
utility.getPortFromUrl = function (url) {
  var location;
  if (url) {
    location = document.createElement('a');
    location.href = url;
  } else {
    location = document.location;
  }
  return location.port === '' ? null : location.port;
};
utility.isUrlSsl = function (url) {
  var location;
  if (url) {
    location = document.createElement('a');
    location.href = url;
  } else {
    location = document.location;
  }
  return location.protocol === 'https:';
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
 *
 * @method loadExternalFiles
 * @param {String} filename
 * @param {String} type 'js' or 'css'
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

utility.docCookies = require('./docCookies');

utility.domReady = require('./domReady');

utility.request = require('./request-browser');
