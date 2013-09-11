
function isBrowser() {
  return typeof(window) !== 'undefined';
}

module.exports = isBrowser() ?  require('./System-browser.js') : require('./System-node.js');
