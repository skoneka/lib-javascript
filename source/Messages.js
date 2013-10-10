var Messages = module.exports = { };

Messages.Monitor = {
  /** content: events **/
  ON_LOAD : 'onLoad',
  /** content: error **/
  ON_ERROR : '_onIoError',
  /** content: { enter: [], leave: [], change } **/
  ON_EVENT_CHANGE : 'onEventChange',
  /** content: streams **/
  ON_STRUCTURE_CHANGE : 'onStructureChange',
  /** content: streams **/
  ON_FILTER_CHANGE : 'onFilterChange'
};


Messages.Filter = {
  /**
   * generic change event called on any change
   * content: {filter, signal, content}
   **/
  ON_CHANGE : 'onChange',
  /**
   * called on streams changes
   * content: streams
   */
  STREAMS_CHANGE : 'streamsChange'

};