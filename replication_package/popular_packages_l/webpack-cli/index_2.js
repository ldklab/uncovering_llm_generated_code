#!/usr/bin/env node

const { execSync } = require('child_process');

// Mapping of command aliases to webpack commands or functions
const commandMap = {
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

// Parse command-line arguments
function parseArgs(argv) {
    let command = '';
    const params = [];

    argv.slice(2).forEach(arg => {
        if (arg.startsWith('-')) {
            params.push(arg);
        } else if (!command) {
            command = arg;
        } else {
            params.push(arg);
        }
    });

    return { command, params };
}

// Execute the CLI tool
function execute() {
    const { command, params } = parseArgs(process.argv);
    const commandFunc = commandMap[command] || commandMap['build'];
    let commandString;

    if (typeof commandFunc === 'function') {
        commandString = commandFunc(...params);
    } else {
        commandString = commandFunc;
    }

    try {
        execSync(commandString, { stdio: 'inherit' });
        process.exit(0);
    } catch (error) {
        console.error('Command execution failed:', error.message);
        process.exit(1);
    }
}

// Run the tool
execute();
