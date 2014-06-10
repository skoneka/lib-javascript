var pryv = require('pryv');

// init (anonymous, offline)

var offlineCon = new pryv.Connection();

offlineCon.attachCredentials({
  username: 'user',
  token: 'token'
});

// init (regular app, existing credentials)

// options and callback are optional
var appExistingCon = new pryv.Connection({
  username: 'user',
  token: 'token'
}, {
  cacheAccessInfo: true,
  cacheStreams: true
}, function (err, con) {});

// init (regular app, no credentials yet)

pryv.signIn({
  appId: 'app id',
  permissions: {},
  options: {},
  onSuccess: function (username, token) {},
  onFailure: function (error) {}
});

// init (trusted)

var trustedCon = pryv.Connection.login({
  username: 'user',
  password: 'pwd',
  appId: 'app id'
});



var con,
    streamData,
    stream;

// for all items, `{item}Data` == item-like, Item object, or array of the same

// STREAMS

//raw
con.streams.create(streamData, function (err, stream) {});
// sugar; notes:
// - stream doesn't truly exist in con until save()
// - cannot add events to stream until saved
(new Stream(streamData, con)).save(function (err) {});

stream.name = 'New name';
// raw
con.streams.update(stream, function (err, updatedStream) {});
// sugar
stream.save(function (err) {});

// raw (options is optional)
con.streams.delete(stream, options, function (err, deletedStreamOrNull) {});
// sugar
stream.delete(options, fn);

con.streams.get(filter, function (err, streams) {});

// EVENTS

con.events.create(eventData, fn);

var event = new pryv.Event(data);
event.addAttachment(formDataOrBuffer_TBD).save(fn);

// sugar: `event.date` is time as Date object (read-write property)

// callback onProgress is optional
con.events.get(filter, function onDone(err, events) {}, function onProgress(events, percentDone) {});


// CHANGE NOTIFICATIONS
// message types: create, update, delete, change (= *)

stream.on('update', fn);
event.on('update:time', fn);

con.on('update:events', function (events, message) {});

var mon = new Monitor(scope);
mon.addConnection(con);
mon.set({ timeFrom: t }, onProcessingCompleteCallback);
mon.on('update:filter:timeFrom', function () {});
mon.on('update:events', fn);
// mon.events and mon.streams are exposed
