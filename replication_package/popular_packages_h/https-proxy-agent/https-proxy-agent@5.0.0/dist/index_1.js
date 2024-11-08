"use strict";

const agent = require('./agent');  // Import the agent module

function createHttpsProxyAgent(opts) {
    return new agent(opts);  // Create and return an instance of the agent with given options
}

// Augment the createHttpsProxyAgent function to add HttpsProxyAgent attributes
(function (createHttpsProxyAgent) {
    createHttpsProxyAgent.HttpsProxyAgent = agent;  // Add the agent class as a static property
    createHttpsProxyAgent.prototype = agent.prototype;  // Add the agent prototype as a static property
})(createHttpsProxyAgent);

// Export the createHttpsProxyAgent function
module.exports = createHttpsProxyAgent;
