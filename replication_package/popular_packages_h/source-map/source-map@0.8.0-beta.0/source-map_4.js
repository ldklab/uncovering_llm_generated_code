// Import and export the SourceMapGenerator, SourceMapConsumer, and SourceNode 
// classes from their respective modules located in the 'lib' directory. 
// These classes are part of the source map support functionality.

const { SourceMapGenerator } = require("./lib/source-map-generator");
const { SourceMapConsumer } = require("./lib/source-map-consumer");
const { SourceNode } = require("./lib/source-node");

module.exports = {
  SourceMapGenerator,
  SourceMapConsumer,
  SourceNode
};
