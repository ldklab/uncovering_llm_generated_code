"use strict";
const agent = require("./agent");

function createSocksProxyAgent(opts) {
    return new agent(opts);
}

createSocksProxyAgent.SocksProxyAgent = agent;
createSocksProxyAgent.prototype = agent.prototype;

module.exports = createSocksProxyAgent;
