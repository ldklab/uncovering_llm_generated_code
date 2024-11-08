"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const redis = require("./redis").default;
const cluster = require("./cluster").default;
const command = require("./command").default;
const ScanStream = require("./ScanStream").default;
const pipeline = require("./pipeline").default;
const AbstractConnector = require("./connectors/AbstractConnector").default;
const SentinelConnector = require("./connectors/SentinelConnector").default;
const SentinelIterator = require("./connectors/SentinelConnector").SentinelIterator;
const { ReplyError } = require("redis-errors");
const PromiseContainer = require("./promiseContainer");

exports = module.exports = redis;
exports.default = redis;
exports.Cluster = cluster;
exports.Command = command;
exports.ScanStream = ScanStream;
exports.Pipeline = pipeline;
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
