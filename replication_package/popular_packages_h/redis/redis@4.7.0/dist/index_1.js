"use strict";

// Import necessary modules
const { createClient: createRedisClient, createCluster: createRedisCluster } = require("@redis/client");
const redisBloom = require("@redis/bloom");
const redisGraph = require("@redis/graph");
const redisJson = require("@redis/json");
const redisSearch = require("@redis/search");
const redisTimeSeries = require("@redis/time-series");

// Re-export everything from these modules
Object.assign(exports, 
  require("@redis/client"), 
  require("@redis/bloom"), 
  require("@redis/graph"), 
  require("@redis/json"), 
  require("@redis/search"), 
  require("@redis/time-series"));

// Combine all the Redis modules into a single object
const modules = {
  ...redisBloom.default,
  graph: redisGraph.default,
  json: redisJson.default,
  ft: redisSearch.default,
  ts: redisTimeSeries.default,
};

// Function to create a Redis client with additional modules
function createClient(options) {
  return createRedisClient({
    ...options,
    modules: {
      ...modules,
      ...options?.modules
    }
  });
}
exports.createClient = createClient;

// Function to create a Redis cluster with additional modules
function createCluster(options) {
  return createRedisCluster({
    ...options,
    modules: {
      ...modules,
      ...options?.modules
    }
  });
}
exports.createCluster = createCluster;
