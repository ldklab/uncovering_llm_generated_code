"use strict";

const util = require("util");
const path = require("path");
const fs = require("fs");
const os = require("os");
const tty = require("tty");
const readline = require("readline");
const chalk = require("chalk"); // For handling chalk template literals
const supportsColor = require("supports-color");
const { formatWithOptions } = require("util");

const defaultLevel = 3; // Define default logging level

/**
 * Formatter for stack traces and log messages.
 */
class Formatter {
  constructor(options = {}) {
    this.options = {
      dateFormat: "HH:mm:ss",
      ...options
    };
  }

  formatStack(stack) {
    return stack.split("\n").map(line => `  ${chalk.grey(line.trim())}`).join("\n");
  }

  formatDate(date) {
    return chalk.gray(date.toLocaleTimeString());
  }

  formatArgs(args) {
    if (formatWithOptions) {
      return util.formatWithOptions({ colors: true }, ...args);
    }
    return util.format(...args);
  }
}

/**
 * Basic Reporter
 * Provides formatted console output with colors and labels for log levels.
 */
class BasicReporter extends Formatter {
  log(logObj) {
    const { type, date, args, level } = logObj;
    const typeOutput = chalk.cyan(type.toUpperCase());

    const dateOutput = this.formatDate(date);

    const message = this.formatArgs(args);
    console.log(`${typeOutput} - ${dateOutput}: ${message}`);
  }
}

/**
 * Logger class supporting different levels and styles.
 */
class Logger {
  constructor(fancy = false) {
    this.reporter = fancy ? new BasicReporter() : null; // Assuming a fancy variant could exist
    this.level = defaultLevel;
    this.isPaused = false;
  }

  addReporter(reporter) {
    this.reporter = reporter;
  }

  setLevel(level) {
    this.level = level;
  }

  log(level, type, args) {
    if (this.isPaused || level > this.level) return;

    const logObj = {
      type, args, level,
      date: new Date()
    };

    this.reporter && this.reporter.log(logObj);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }
}

// Create a global consola instance
const consola = new Logger();
global.consola = consola; 

// Set default reporters
consola.addReporter(new BasicReporter());

module.exports = consola;
