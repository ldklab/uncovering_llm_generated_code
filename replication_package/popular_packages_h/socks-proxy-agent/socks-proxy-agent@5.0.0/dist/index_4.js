"use strict";

const Agent = require("./agent");

function createSocksProxyAgent(options) {
    return new Agent(options);
}

createSocksProxyAgent.SocksProxyAgent = Agent;
createSocksProxyAgent.prototype = Agent.prototype;

module.exports = createSocksProxyAgent;
