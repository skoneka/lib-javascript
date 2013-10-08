var Messages = module.exports = { };

Messages.Monitor = {
  /** content: events **/
  ON_LOAD : 'onLoad',
  /** content: error **/
  ON_ERROR : 'onError',
  /** content: { enter: [], leave: [], change } **/
  ON_EVENT_CHANGE : 'onEventChange',
  /** content: streams **/
  ON_STRUCTURE_CHANGE : 'onStructureChange'
};