"use strict";
const { default: DefaultRedisExport } = require("./Redis");
const { default: RedisDefault } = require("./Redis");
const { default: ClusterDefault } = require("./cluster");
const { default: CommandDefault } = require("./Command");
const { default: ScanStreamDefault } = require("./ScanStream");
const { default: PipelineDefault } = require("./Pipeline");
const { default: AbstractConnectorDefault } = require("./connectors/AbstractConnector");
const { default: SentinelConnectorDefault, SentinelIterator } = require("./connectors/SentinelConnector");
const { ReplyError } = require("redis-errors");

exports = module.exports = DefaultRedisExport;
exports.default = RedisDefault;
exports.Redis = RedisDefault;
exports.Cluster = ClusterDefault;
exports.Command = CommandDefault;
exports.ScanStream = ScanStreamDefault;
exports.Pipeline = PipelineDefault;
exports.AbstractConnector = AbstractConnectorDefault;
exports.SentinelConnector = SentinelConnectorDefault;
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
