const WebpackCLI = require('./webpack-cli');
const { commands } = require('./utils/cli-flags');
const logger = require('./utils/logger');
const getPackageManager = require('./utils/get-package-manager');

module.exports = WebpackCLI;

module.exports.utils = {
    logger,
    commands,
    getPackageManager,
};
