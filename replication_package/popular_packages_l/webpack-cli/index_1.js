#!/usr/bin/env node

const { execSync } = require('child_process');

// Define commands and their shorthands
const commands = {
    build: 'webpack',
    bundle: 'webpack',
    b: 'webpack',

    configtest: configPath => `webpack --config-test ${configPath}`,
    t: configPath => `webpack --config-test ${configPath}`,

    help: 'webpack --help',
    h: 'webpack --help',

    info: 'webpack-cli info',
    i: 'webpack-cli info',

    init: (genPath = '.') => `webpack-cli init ${genPath}`,
    create: (genPath = '.') => `webpack-cli init ${genPath}`,
    new: (genPath = '.') => `webpack-cli init ${genPath}`,
    c: (genPath = '.') => `webpack-cli init ${genPath}`,
    n: (genPath = '.') => `webpack-cli init ${genPath}`,

    loader: outputPath => `webpack-cli loader ${outputPath}`,
    l: outputPath => `webpack-cli loader ${outputPath}`,

    plugin: outputPath => `webpack-cli plugin ${outputPath}`,
    p: outputPath => `webpack-cli plugin ${outputPath}`,

    serve: 'webpack serve',
    server: 'webpack serve',
    s: 'webpack serve',

    version: 'webpack --version',
    v: 'webpack --version',

    watch: 'webpack --watch',
    w: 'webpack --watch',
};

// Parse command line arguments
function parseArguments(argv) {
    const [ , , command = '', ...args ] = argv;
    return { command, args };
}

// Execute the appropriate command based on user input
function main() {
    const { command, args } = parseArguments(process.argv);
    const commandFunc = commands[command] || commands.build;
    const cmdStr = typeof commandFunc === 'function' ? commandFunc(...args) : commandFunc;

    try {
        execSync(cmdStr, { stdio: 'inherit' });
        process.exit(0);
    } catch (error) {
        console.error('Error executing command:', error.message);
        process.exit(1);
    }
}

main();
