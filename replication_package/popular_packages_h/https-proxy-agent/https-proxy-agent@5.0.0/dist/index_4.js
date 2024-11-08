"use strict";

const agent = require("./agent");

function createHttpsProxyAgent(opts) {
    return new agent(opts);
}

createHttpsProxyAgent.HttpsProxyAgent = agent;
createHttpsProxyAgent.prototype = agent.prototype;

module.exports = createHttpsProxyAgent;
