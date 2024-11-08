"use strict";

const Redis = require("./Redis").default;
const cluster = require("./cluster").default;
const Command = require("./Command").default;
const ScanStream = require("./ScanStream").default;
const Pipeline = require("./Pipeline").default;
const AbstractConnector = require("./connectors/AbstractConnector").default;
const SentinelConnector = require("./connectors/SentinelConnector").default;
const { SentinelIterator } = require("./connectors/SentinelConnector");

// Exporting modules
module.exports = Redis;
exports.default = Redis;
exports.Redis = Redis;
exports.Cluster = cluster;
exports.Command = Command;
exports.ScanStream = ScanStream;
exports.Pipeline = Pipeline;
exports.AbstractConnector = AbstractConnector;
exports.SentinelConnector = SentinelConnector;
exports.SentinelIterator = SentinelIterator;

// External module without TypeScript definitions
exports.ReplyError = require("redis-errors").ReplyError;

// Handling Promise library override—logs warning and retains native Promise
Object.defineProperty(exports, "Promise", {
    get() {
        console.warn("ioredis v5 does not support plugging third-party Promise library anymore. Native Promise will be used.");
        return Promise;
    },
    set() {
        console.warn("ioredis v5 does not support plugging third-party Promise library anymore. Native Promise will be used.");
    },
});

// Print function for handling command callbacks
function print(err, reply) {
    if (err) {
        console.log("Error: " + err);
    } else {
        console.log("Reply: " + reply);
    }
}
exports.print = print;
