"use strict";

const { default: HttpsProxyAgent } = require('./agent');

function createHttpsProxyAgent(opts) {
    return new HttpsProxyAgent(opts);
}

createHttpsProxyAgent.HttpsProxyAgent = HttpsProxyAgent;
createHttpsProxyAgent.prototype = HttpsProxyAgent.prototype;

module.exports = createHttpsProxyAgent;
