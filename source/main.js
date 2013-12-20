module.exports = {
  // TODO: fix singleton (see with me [sgoumaz] if needed)
  Auth: require('./auth/Auth.js'),
  Connection: require('./Connection.js'),
  Event: require('./Event.js'),
  Stream: require('./Stream.js'),
  Filter: require('./Filter.js'),
  system: require('./system/system.js'),
  utility: require('./utility/utility.js'),

  eventTypes: require('./eventTypes.js')
};
