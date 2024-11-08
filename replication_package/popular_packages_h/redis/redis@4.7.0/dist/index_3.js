"use strict";

const { createClient: RedisCreateClient, createCluster: RedisCreateCluster } = require("@redis/client");
const RedisBloom = require("@redis/bloom");
const RedisGraph = require("@redis/graph");
const RedisJson = require("@redis/json");
const RedisSearch = require("@redis/search");
const RedisTimeSeries = require("@redis/time-series");

Object.assign(exports, require("@redis/client"));
Object.assign(exports, require("@redis/bloom"));
Object.assign(exports, require("@redis/graph"));
Object.assign(exports, require("@redis/json"));
Object.assign(exports, require("@redis/search"));
Object.assign(exports, require("@redis/time-series"));

const modules = {
    ...RedisBloom.default,
    graph: RedisGraph.default,
    json: RedisJson.default,
    ft: RedisSearch.default,
    ts: RedisTimeSeries.default
};

function createClient(options) {
    return RedisCreateClient({
        ...options,
        modules: {
            ...modules,
            ...options?.modules
        }
    });
}

function createCluster(options) {
    return RedisCreateCluster({
        ...options,
        modules: {
            ...modules,
            ...options?.modules
        }
    });
}

exports.createClient = createClient;
exports.createCluster = createCluster;
