// file Pryv

var Pryv =  {
  Connection : require('./model/Connection.js'),
  System : require('./system/System.js'),
  Filter : require('./model/Filter.js')
};


var connectionSettings = {
  userid : 'perkikiki',
  domain : 'pryv.in',
  token : 'Ve-U8SCASM',
  port : 443,
  ssl : true
};


var f1 = new Pryv.Filter();

var c1 = new Pryv.Connection(connectionSettings.userid, connectionSettings.token);
c1.connectionSettings.domain = connectionSettings.domain;


var c2 = new Pryv.Connection('bob', null);
c2.connectionSettings.domain = 'blip';




c1.events.get(f1, function (error, result) {
  console.error(error);
  console.log(result);
});

module.exports = Pryv;

