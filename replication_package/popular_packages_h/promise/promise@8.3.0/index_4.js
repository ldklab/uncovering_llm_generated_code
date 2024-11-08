'use strict';

try {
    const libModule = require('./lib');
    console.log('Successfully loaded ./lib module');
    module.exports = libModule;
} catch (error) {
    console.error('Failed to load ./lib module', error);
    throw error; // rethrow the error after logging it
}
