/* global document */

var urls = module.exports = {};

/**
 * The one and only reference for Pryv domain names.
 * TODO: client and server will merge
 */
/*
urls.domains = {
  client: {
    production: 'pryv.me',
    staging: 'pryv.li',
    test: 'rec.la'
  },
  server: {
    production: 'pryv.io',
    staging: 'pryv.in',
    test: 'pryv.in'
  },
  register: {
    production: 'reg.pryv.io',
    staging: 'reg.pryv.in'
  }
};
*/

urls.domains = {
  client: {
    production: 'pryv.me',
    staging: 'pryv.li',
    test: 'rec.la'
  },
  server: {
    production: 'pryv.me',
    staging: 'pryv.li',
    test: 'pryv.in'
  },
  register: {
    production: 'reg.pryv.me',
    staging: 'reg.pryv.li',
    test: 'reg.pryv.li'
  }
};

/**
 * Detects the Pryv environment from the given domain and client/server indication.
 *
 * @param {string} domain
 * @param {string} type "client" or "server"
 * @returns {string} "production", "staging" or "other"
 */
urls.getEnvironment = function (domain, type) {
  var domains = this.domains[type];
  if (! type || ! domains) {
    throw new Error('Invalid type "' + type + '"; expected "client" or "server"');
  }

  switch (domain) {
  case domains.production:
    return 'production';
  case domains.staging:
    return 'staging';
  case domains.test:
    return 'test';
  default:
    return 'other';
  }
};

/* jshint -W101 */
/**
 * Extracts base components from a browser URL string
 * (e.g. today: "https://username.pryv.me:443/some/path").
 *
 * @param url Defaults to `document.location` if available
 * @returns {URLInfo}
 */
urls.parseClientURL = function (url) {
  return new URLInfo(url, 'client');
};

/**
 * Extracts base components from a standard Pryv API URL string
 * (e.g. "https://username.pryv.io:443/some/path").
 *
 * @param url
 * @returns {URLInfo}
 */
urls.parseServerURL = function (url) {
  return new URLInfo(url, 'server');
};

/**
 * @param {String} url
 * @param {String} type "client" or "server"
 * @constructor
 */
function URLInfo(url, type) {
  var loc;
  if (document) {
    // browser
    if (url) {
      loc = document.createElement('a');
      loc.href = url;
    } else {
      loc = document.location;
    }
  } else {
    // node
    if (! url) {
      throw new Error('`url` is required');
    }
    loc = require('url').parse(url);
  }
  if (! (type === 'client' || type === 'server')) {
    throw new Error('`type` must be either "client" or "server"');
  }
  this.type = type;

  this.protocol = loc.protocol;
  this.hostname = loc.hostname;
  this.port = loc.port || (this.protocol === 'https:' ? 443 : 80);
  this.path = loc.pathname;
  this.hash = loc.hash;
  this.search = loc.search;

  var splitHostname = loc.hostname.split('.');
  if (splitHostname.length >= 3 /* TODO: check & remove, shouldn't be necessary && splitHostname[0].match(this.regex.username)*/) {
    this.subdomain = splitHostname[0];
  }
  this.domain = loc.hostname.substr(loc.hostname.indexOf('.') + 1);

  this.environment = urls.getEnvironment(this.domain, this.type);

  // if known environment, extract username
  // (we currently assume username === subdomain; this will change for client URLs)
  if (this.subdomain && this.environment !== 'other') {
    this.username = this.subdomain;
  }
}

URLInfo.prototype.isSSL = function () {
  return this.protocol === 'https:';
};

URLInfo.prototype.parseQuery = function () {
  var objURL = {};
  this.search.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), function ($0, $1, $2, $3) {
    objURL[$1] = $3;
  });
  return objURL;
};

URLInfo.prototype.parseSharingTokens = function () {
  if (this.type !== 'client') {
    throw new Error('Can only parse on client URLs');
  }
  var splitPath = this.hash.split('/');
  var sharingsIndex = splitPath.indexOf('sharings');
  if (sharingsIndex !== -1) {
    return splitPath.splice(sharingsIndex + 1).filter(function (s) { return s.length > 0; });
  } else {
    return [];
  }
};
