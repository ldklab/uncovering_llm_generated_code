"use strict";

const redisDefault = require("./redis").default;
const { default: Cluster } = require("./cluster");
const { default: Command } = require("./command");
const { default: ScanStream } = require("./ScanStream");
const { default: Pipeline } = require("./pipeline");
const { default: AbstractConnector } = require("./connectors/AbstractConnector");
const { default: SentinelConnector, SentinelIterator } = require("./connectors/SentinelConnector");
const { ReplyError } = require("redis-errors");
const PromiseContainer = require("./promiseContainer");

exports = module.exports = redisDefault;
exports.default = redisDefault;
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
