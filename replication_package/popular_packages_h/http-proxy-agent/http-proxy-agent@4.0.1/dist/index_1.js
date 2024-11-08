"use strict";

const HttpProxyAgent = require("./agent");

function createHttpProxyAgent(opts) {
    return new HttpProxyAgent(opts);
}

createHttpProxyAgent.HttpProxyAgent = HttpProxyAgent;
createHttpProxyAgent.prototype = HttpProxyAgent.prototype;

module.exports = createHttpProxyAgent;
