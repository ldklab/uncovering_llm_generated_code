/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

const { SourceMapGenerator } = require("./lib/source-map-generator");
const { SourceMapConsumer } = require("./lib/source-map-consumer");
const { SourceNode } = require("./lib/source-node");

exports.SourceMapGenerator = SourceMapGenerator;
exports.SourceMapConsumer = SourceMapConsumer;
exports.SourceNode = SourceNode;
