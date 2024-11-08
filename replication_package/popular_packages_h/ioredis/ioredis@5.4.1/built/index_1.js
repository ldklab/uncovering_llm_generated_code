"use strict";

// Export the default export from Redis.js both as module.exports and as a named export
module.exports = exports = require("./Redis").default;
var Redis_1 = require("./Redis");
Object.defineProperty(exports, "default", { enumerable: true, get: function() { return Redis_1.default; } });

// Export the Redis class from Redis.js as a named export
var Redis_2 = require("./Redis");
Object.defineProperty(exports, "Redis", { enumerable: true, get: function() { return Redis_2.default; } });

// Export the Cluster class from cluster.js as a named export
var cluster_1 = require("./cluster");
Object.defineProperty(exports, "Cluster", { enumerable: true, get: function() { return cluster_1.default; } });

// Export the Command class from Command.js as a named export
var Command_1 = require("./Command");
Object.defineProperty(exports, "Command", { enumerable: true, get: function() { return Command_1.default; } });

// Export the ScanStream class from ScanStream.js as a named export
var ScanStream_1 = require("./ScanStream");
Object.defineProperty(exports, "ScanStream", { enumerable: true, get: function() { return ScanStream_1.default; } });

// Export the Pipeline class from Pipeline.js as a named export
var Pipeline_1 = require("./Pipeline");
Object.defineProperty(exports, "Pipeline", { enumerable: true, get: function() { return Pipeline_1.default; } });

// Export the AbstractConnector class from connectors/AbstractConnector.js as a named export
var AbstractConnector_1 = require("./connectors/AbstractConnector");
Object.defineProperty(exports, "AbstractConnector", { enumerable: true, get: function() { return AbstractConnector_1.default; } });

// Export the SentinelConnector and SentinelIterator from connectors/SentinelConnector.js as named exports
var SentinelConnector_1 = require("./connectors/SentinelConnector");
Object.defineProperty(exports, "SentinelConnector", { enumerable: true, get: function() { return SentinelConnector_1.default; } });
Object.defineProperty(exports, "SentinelIterator", { enumerable: true, get: function() { return SentinelConnector_1.SentinelIterator; } });

// Export ReplyError from redis-errors module
exports.ReplyError = require("redis-errors").ReplyError;

// Handle deprecated usage of third-party Promise library
Object.defineProperty(exports, "Promise", {
    get() {
        console.warn("ioredis v5 does not support plugging third-party Promise library anymore. Native Promise will be used.");
        return Promise;
    },
    set(_lib) {
        console.warn("ioredis v5 does not support plugging third-party Promise library anymore. Native Promise will be used.");
    },
});

// Define a helper function to print errors and replies
function print(err, reply) {
    if (err) {
        console.log("Error: " + err);
    } else {
        console.log("Reply: " + reply);
    }
}

exports.print = print;
