"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const { createClient: redisCreateClient, createCluster: redisCreateCluster } = require("@redis/client");
const redisBloom = require("@redis/bloom");
const redisGraph = require("@redis/graph");
const redisJson = require("@redis/json");
const redisSearch = require("@redis/search");
const redisTimeSeries = require("@redis/time-series");

Object.assign(exports, redisBloom, redisGraph, redisJson, redisSearch, redisTimeSeries);

const modules = {
    ...redisBloom.default,
    graph: redisGraph.default,
    json: redisJson.default,
    ft: redisSearch.default,
    ts: redisTimeSeries.default
};

function createClient(options = {}) {
    return redisCreateClient({
        ...options,
        modules: {
            ...modules,
            ...(options.modules || {})
        }
    });
}
exports.createClient = createClient;

function createCluster(options = {}) {
    return redisCreateCluster({
        ...options,
        modules: {
            ...modules,
            ...(options.modules || {})
        }
    });
}
exports.createCluster = createCluster;
