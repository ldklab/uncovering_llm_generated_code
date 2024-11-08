"use strict";
const RedisDefault = require("./Redis").default;
const { default: Redis } = require("./Redis");
const { default: Cluster } = require("./cluster");
const { default: Command } = require("./Command");
const { default: ScanStream } = require("./ScanStream");
const { default: Pipeline } = require("./Pipeline");
const { default: AbstractConnector } = require("./connectors/AbstractConnector");
const { default: SentinelConnector, SentinelIterator } = require("./connectors/SentinelConnector");
const { ReplyError } = require("redis-errors");

module.exports = RedisDefault;

exports.default = Redis;
exports.Redis = Redis;
exports.Cluster = Cluster;
exports.Command = Command;
exports.ScanStream = ScanStream;
exports.Pipeline = Pipeline;
exports.AbstractConnector = AbstractConnector;
exports.SentinelConnector = SentinelConnector;
exports.SentinelIterator = SentinelIterator;
exports.ReplyError = ReplyError;

Object.defineProperty(exports, "Promise", {
    get() {
        console.warn("ioredis v5 does not support plugging third-party Promise library anymore. Native Promise will be used.");
        return Promise;
    },
    set(_lib) {
        console.warn("ioredis v5 does not support plugging third-party Promise library anymore. Native Promise will be used.");
    },
});

function print(err, reply) {
    if (err) {
        console.log("Error: " + err);
    } else {
        console.log("Reply: " + reply);
    }
}
exports.print = print;
