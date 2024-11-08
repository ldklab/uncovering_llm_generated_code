"use strict";
const redis = require("./redis");
const cluster = require("./cluster");
const command = require("./command");
const ScanStream = require("./ScanStream");
const pipeline = require("./pipeline");
const AbstractConnector = require("./connectors/AbstractConnector");
const SentinelConnector = require("./connectors/SentinelConnector");
const { ReplyError } = require("redis-errors");
const PromiseContainer = require("./promiseContainer");

module.exports = redis.default;
exports.default = redis.default;
exports.Cluster = cluster.default;
exports.Command = command.default;
exports.ScanStream = ScanStream.default;
exports.Pipeline = pipeline.default;
exports.AbstractConnector = AbstractConnector.default;
exports.SentinelConnector = SentinelConnector.default;
exports.SentinelIterator = SentinelConnector.SentinelIterator;
exports.ReplyError = ReplyError;

Object.defineProperty(exports, "Promise", {
    get() {
        return PromiseContainer.get();
    },
    set(lib) {
        PromiseContainer.set(lib);
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
