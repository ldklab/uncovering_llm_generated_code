"use strict";

module.exports = (function() {
  const Processor = require('./processor').default;
  const selectors = require('./selectors');

  function createParser(processor) {
    return new Processor(processor);
  }

  Object.assign(createParser, selectors);

  return createParser;
})();
