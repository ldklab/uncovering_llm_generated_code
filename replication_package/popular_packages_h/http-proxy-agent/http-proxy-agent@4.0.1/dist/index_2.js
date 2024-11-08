"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

const Agent = __importDefault(require("./agent")).default;

function createHttpProxyAgent(opts) {
    return new Agent(opts);
}

createHttpProxyAgent.HttpProxyAgent = Agent;
createHttpProxyAgent.prototype = Agent.prototype;

module.exports = createHttpProxyAgent;
