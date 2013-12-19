module.exports = {
  Connection: require('./Connection.js'),
  Event: require('./Event.js'),
  Stream: require('./Stream.js'),
  Filter: require('./Filter.js'),
  System: require('./system/System.js'),
  // TODO: rename this to auth and fix singleton (see with me [sgoumaz] if needed)
  access: require('./auth/Auth.js'),
  Utility: require('./utility/Utility.js'),
  Messages: require('./Messages.js'),

  eventTypes: require('./eventTypes.js')
};
