"use strict";
const { default: RedisDefault } = require("./redis");
exports = module.exports = RedisDefault;
Object.defineProperty(exports, "__esModule", { value: true });

// Named exports from different modules
const { default: Cluster } = require("./cluster");
const { default: Command } = require("./command");
const { default: ScanStream } = require("./ScanStream");
const { default: Pipeline } = require("./pipeline");
const { default: AbstractConnector } = require("./connectors/AbstractConnector");
const {
  default: SentinelConnector,
  SentinelIterator: SentinelIter
} = require("./connectors/SentinelConnector");

// Redis error handling
const { ReplyError } = require("redis-errors");

// Promise management via a container
const PromiseContainer = require("./promiseContainer");
Object.defineProperty(exports, "Promise", {
  get() {
    return PromiseContainer.get();
  },
  set(lib) {
    PromiseContainer.set(lib);
  },
});

// Function to print errors or replies
function print(err, reply) {
  if (err) {
    console.log("Error: " + err);
  } else {
    console.log("Reply: " + reply);
  }
}

// Named exports
exports.Cluster = Cluster;
exports.Command = Command;
exports.ScanStream = ScanStream;
exports.Pipeline = Pipeline;
exports.AbstractConnector = AbstractConnector;
exports.SentinelConnector = SentinelConnector;
exports.SentinelIterator = SentinelIter;
exports.ReplyError = ReplyError;
exports.print = print;
