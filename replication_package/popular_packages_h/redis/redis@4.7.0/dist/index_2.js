"use strict";

const { createClient: redisCreateClient, createCluster: redisCreateCluster } = require("@redis/client");
const bloom = require("@redis/bloom");
const graph = require("@redis/graph");
const json = require("@redis/json");
const search = require("@redis/search");
const timeSeries = require("@redis/time-series");

const modules = {
    ...bloom.default,
    graph: graph.default,
    json: json.default,
    ft: search.default,
    ts: timeSeries.default
};

function createClient(options) {
    return redisCreateClient({
        ...options,
        modules: {
            ...modules,
            ...options?.modules
        }
    });
}

function createCluster(options) {
    return redisCreateCluster({
        ...options,
        modules: {
            ...modules,
            ...options?.modules
        }
    });
}

module.exports = {
    ...require("@redis/client"),
    ...require("@redis/bloom"),
    ...require("@redis/graph"),
    ...require("@redis/json"),
    ...require("@redis/search"),
    ...require("@redis/time-series"),
    createClient,
    createCluster
};
