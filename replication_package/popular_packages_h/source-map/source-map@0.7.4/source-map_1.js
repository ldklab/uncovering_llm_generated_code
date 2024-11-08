// Source map functionality modules
const SourceMapGenerator = require("./lib/source-map-generator").SourceMapGenerator;
const SourceMapConsumer = require("./lib/source-map-consumer").SourceMapConsumer;
const SourceNode = require("./lib/source-node").SourceNode;

// Exporting functionalities for external usage
module.exports = {
  SourceMapGenerator,
  SourceMapConsumer,
  SourceNode
};
