"use strict";

const path = require("path");
const os = require("os");
const tty = require("tty");
const fs = require("fs");

// Helper functions
const importDefault = (module) => module && typeof module === 'object' && 'default' in module ? module.default : module;

const { formatWithOptions } = importDefault(require("util"));

// CI Environment Detection
const ciVendors = [
  { name: "Travis CI", env: "TRAVIS" },
  { name: "CircleCI", env: "CIRCLECI" },
  // Add other CI environments here...
];

function detectCIEnvironment() {
  const env = process.env;
  for (const { name, env: varName } of ciVendors) {
    if (env[varName]) {
      return { name, ci: true };
    }
  }
  return { ci: false };
}

const ciEnvironment = detectCIEnvironment();
const isCI = ciEnvironment.ci;

// Logger Levels
const LogLevel = {
  Fatal: 0,
  Error: 0,
  Warn: 1,
  Log: 2,
  Info: 3,
  Debug: 4,
  Trace: 5,
  Silent: -Infinity,
  Verbose: Infinity
};

// Simple Logger
class Logger {
  constructor({ level = LogLevel.Info } = {}) {
    this.level = level;
  }

  log(level, ...args) {
    if (level <= this.level) {
      console.log(...args);
    }
  }

  error(...args) {
    this.log(LogLevel.Error, ...args);
  }

  warn(...args) {
    this.log(LogLevel.Warn, ...args);
  }

  info(...args) {
    this.log(LogLevel.Info, ...args);
  }
}

// Environment Specific Configurations
const isTTY = tty.isatty(1);
const platform = os.platform();
const config = {
  isCI,
  isTTY,
  platform,
  // Additional configurations or modifications
};

// Exporting the consola instance with configurations
const consola = new Logger({ level: isCI ? LogLevel.Warn : LogLevel.Debug });

module.exports = {
  consola,
  LogLevel,
  config
};
