"use strict";
const Agent = require("./agent");

function createHttpProxyAgent(opts) {
    return new Agent(opts);
}

createHttpProxyAgent.HttpProxyAgent = Agent;
createHttpProxyAgent.prototype = Agent.prototype;

module.exports = createHttpProxyAgent;
