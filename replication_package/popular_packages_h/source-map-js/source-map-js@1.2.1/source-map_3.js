/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

const SourceMapGenerator = require('./lib/source-map-generator').SourceMapGenerator;
const SourceMapConsumer = require('./lib/source-map-consumer').SourceMapConsumer;
const SourceNode = require('./lib/source-node').SourceNode;

module.exports = {
  SourceMapGenerator,
  SourceMapConsumer,
  SourceNode,
};
