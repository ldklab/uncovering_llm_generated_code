"use strict";

const agent = require("./agent");

function createHttpProxyAgent(opts) {
    return new agent(opts);
}

createHttpProxyAgent.HttpProxyAgent = agent;
createHttpProxyAgent.prototype = agent.prototype;

module.exports = createHttpProxyAgent;
