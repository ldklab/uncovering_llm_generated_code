#!/usr/bin/env node

const { execSync } = require('child_process');

// List of commands and their shorthands
const commands = {
    build: 'webpack',
    bundle: 'webpack',
    b: 'webpack',

    configtest: (configPath) => `webpack --config-test ${configPath}`,
    t: (configPath) => `webpack --config-test ${configPath}`,

    help: 'webpack --help',
    h: 'webpack --help',

    info: 'webpack-cli info',
    i: 'webpack-cli info',

    init: (genPath = '.') => `webpack-cli init ${genPath}`,
    create: (genPath = '.') => `webpack-cli init ${genPath}`,
    new: (genPath = '.') => `webpack-cli init ${genPath}`,
    c: (genPath = '.') => `webpack-cli init ${genPath}`,
    n: (genPath = '.') => `webpack-cli init ${genPath}`,

    loader: (outputPath) => `webpack-cli loader ${outputPath}`,
    l: (outputPath) => `webpack-cli loader ${outputPath}`,

    plugin: (outputPath) => `webpack-cli plugin ${outputPath}`,
    p: (outputPath) => `webpack-cli plugin ${outputPath}`,

    serve: 'webpack serve',
    server: 'webpack serve',
    s: 'webpack serve',

    version: 'webpack --version',
    v: 'webpack --version',

    watch: 'webpack --watch',
    w: 'webpack --watch',
};

// Map from argv to command
function parseArguments(argv) {
    let command = '';
    const args = [];
    
    argv.slice(2).forEach(arg => {
        if (arg.startsWith('-')) {
            args.push(arg);
        } else if (command === '') {
            command = arg;
        } else {
            args.push(arg);
        }
    });

    return { command, args };
}

// Main function to execute commands based on input
function main() {
    const { command, args } = parseArguments(process.argv);
    const commandFunc = commands[command] || commands['build'];
    let cmdStr;

    if (typeof commandFunc === 'function') {
        cmdStr = commandFunc(...args);
    } else {
        cmdStr = commandFunc;
    }

    try {
        const result = execSync(cmdStr, { stdio: 'inherit' });
        process.exit(0);
    } catch (error) {
        console.error('Error executing command:', error.message);
        process.exit(1);
    }
}

// Run the main CLI processor
main();
