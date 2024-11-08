'use strict';

module.exports = (() => {
  const rollup = require('./shared/rollup.js');
  const fs = require('fs');
  const path = require('path');
  const crypto = require('crypto');
  const events = require('events');

  return {
    VERSION: rollup.version,
    rollup: rollup.rollup,
    watch: rollup.watch,
  };
})();

//# sourceMappingURL=rollup.js.map
