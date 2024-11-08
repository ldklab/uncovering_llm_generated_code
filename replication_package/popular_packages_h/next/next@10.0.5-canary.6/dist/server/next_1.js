"use strict";

const NextServer = require('../next-server/server/next-server').default;
const { NON_STANDARD_NODE_ENV } = require('../lib/constants');
const log = require('../build/output/log');

function createServer(options) {
    const standardEnv = ['production', 'development', 'test'];
    
    if (!options) {
        throw new Error('The server has not been instantiated properly. https://err.sh/next.js/invalid-server-options');
    }
    
    if (!options.isNextDevCommand && process.env.NODE_ENV && !standardEnv.includes(process.env.NODE_ENV)) {
        log.warn(NON_STANDARD_NODE_ENV);
    }
    
    if (options.dev) {
        if (typeof options.dev !== 'boolean') {
            console.warn("Warning: 'dev' is not a boolean which could introduce unexpected behavior. https://err.sh/next.js/invalid-server-options");
        }
        const DevServer = require('./next-dev-server').default;
        return new DevServer(options);
    }
    
    return new NextServer(options);
}

module.exports = createServer;
exports.default = createServer;
