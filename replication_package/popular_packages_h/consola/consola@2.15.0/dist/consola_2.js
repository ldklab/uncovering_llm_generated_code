"use strict";

function getDefaultExport(module) {
    return module && typeof module === 'object' && 'default' in module ? module.default : module;
}

const util = getDefaultExport(require("util"));
const path = require("path");
const fs = require("fs");
const os = getDefaultExport(require("os"));
const tty = getDefaultExport(require("tty"));

// Environment & CI/CD Detection
const ciServiceData = [
    { name: "AppVeyor", constant: "APPVEYOR", env: "APPVEYOR", pr: "APPVEYOR_PULL_REQUEST_NUMBER" },
    // ...other CI/CD services
    { name: "Travis CI", constant: "TRAVIS", env: "TRAVIS", pr: { env: "TRAVIS_PULL_REQUEST", ne: "false" } }
];

function isEnvironmentVarSet(envDescriptor) {
    if (typeof envDescriptor === 'string') {
        return !!process.env[envDescriptor];
    }

    return Object.keys(envDescriptor).every((key) => process.env[key] === envDescriptor[key]);
}

function detectCiEnvironment(envVars = process.env) {
    let ci = false;
    let pr = null;
    let name = null;

    ciServiceData.forEach(service => {
        const isCi = Array.isArray(service.env) 
            ? service.env.every(env => isEnvironmentVarSet(env))
            : isEnvironmentVarSet(service.env);

        if (isCi) {
            ci = true;
            name = service.name;

            if (typeof service.pr === 'string') {
                pr = !!envVars[service.pr];
            } else if (service.pr) {
                if ('env' in service.pr) {
                    pr = service.pr.env in envVars && envVars[service.pr.env] !== service.pr.ne;
                } else if ('any' in service.pr) {
                    pr = service.pr.any.some(prEnv => !!envVars[prEnv]);
                } else {
                    pr = isEnvironmentVarSet(service.pr);
                }
            }
        }
    });

    return { ci, name, pr, isCI: ci, isPR: pr };
}

const ciEnv = detectCiEnvironment();

// Define Logging Levels
const LogLevel = {
    Fatal: 0,
    Error: 0,
    Warn: 1,
    Log: 2,
    Info: 3,
    Success: 3,
    Debug: 4,
    Trace: 5,
    Silent: -Infinity,
    Verbose: Infinity
};

// Console Logger Class
class ConsoleLogger {
    constructor(options = {}) {
        this.reporters = options.reporters || [];
        this.level = options.level !== undefined ? options.level : 3;
        this.wrapConsole();
    }

    log(level, ...args) {
        if (level > this.level) return;
        const message = util.format(...args);
        this._log({ level, date: new Date(), args, message });
    }

    _log(logObj) {
        for (const reporter of this.reporters) {
            reporter.log(logObj);
        }
    }

    wrapConsole() {
        for (const level in LogLevel) {
            if (LogLevel.hasOwnProperty(level)) {
                console[level.toLowerCase()] = (...args) => this.log(LogLevel[level], ...args);
            }
        }
    }
}

// Exporting the Logger
const consola = new ConsoleLogger({ level: ciEnv.isCI ? LogLevel.Warn : LogLevel.Debug });

module.exports = consola;
