// file Pryv

function isBrowser() {
  return typeof(window) !== 'undefined';
}


var Pryv =  {
  Connection : require('./model/Connection.js'),
  System : isBrowser() ? require('./system/Browser.js') : require('./system/Node.js')
};

module.exports = Pryv;

