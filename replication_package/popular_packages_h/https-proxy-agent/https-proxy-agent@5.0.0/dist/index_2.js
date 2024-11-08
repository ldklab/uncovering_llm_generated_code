"use strict";
const Agent = require("./agent");

function createHttpsProxyAgent(opts) {
    return new Agent(opts);
}

createHttpsProxyAgent.HttpsProxyAgent = Agent;
createHttpsProxyAgent.prototype = Agent.prototype;

module.exports = createHttpsProxyAgent;
