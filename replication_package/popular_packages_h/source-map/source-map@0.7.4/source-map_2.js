// Load and export modules related to handling source maps from the ./lib directory
const { SourceMapGenerator } = require("./lib/source-map-generator");
const { SourceMapConsumer } = require("./lib/source-map-consumer");
const { SourceNode } = require("./lib/source-node");

// Export the loaded modules for external use
exports.SourceMapGenerator = SourceMapGenerator;
exports.SourceMapConsumer = SourceMapConsumer;
exports.SourceNode = SourceNode;
