"use strict";

const util = require("util");
const path = require("path");
const fs = require("fs");
const os = require("os");
const tty = require("tty");

// Function that returns default export if available
function getDefaultExport(module) {
  return module && typeof module === 'object' && 'default' in module ? module.default : module;
}

// Detects current global context
(function () {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  if (typeof self !== "undefined") return self;
})();

// Helper to create exports
function createModule(factory) {
  const module = { exports: {} };
  factory(module, module.exports);
  return module.exports;
}

// Continuous Integration environments detection
const ciEnvironments = (function () {
  return [
    { name: "AppVeyor", constant: "APPVEYOR", env: "APPVEYOR", pr: "APPVEYOR_PULL_REQUEST_NUMBER" },
    { name: "Bamboo", constant: "BAMBOO", env: "bamboo_planKey" },
    { name: "Bitbucket Pipelines", constant: "BITBUCKET", env: "BITBUCKET_COMMIT" },
    { name: "Bitrise", constant: "BITRISE", env: "BITRISE_IO", pr: "BITRISE_PULL_REQUEST" },
    { name: "Buddy", constant: "BUDDY", env: "BUDDY_WORKSPACE_ID", pr: "BUDDY_EXECUTION_PULL_REQUEST_ID" },
    // ... Other CI environments
  ];
})();

// Env Detection
const envConfig = createModule((module, exports) => {
  const env = process.env;

  function matchesEnvCondition(condition) {
    if (typeof condition === "string") return Boolean(env[condition]);
    return Object.keys(condition).every(key => env[key] === condition[key]);
  }

  Object.defineProperty(exports, "_vendors", {
    value: ciEnvironments.map(env => env.constant),
  });

  exports.name = null;
  exports.isPR = null;

  for (const envInfo of ciEnvironments) {
    const isCI = (Array.isArray(envInfo.env) ? envInfo.env : [envInfo.env])
      .every(varName => matchesEnvCondition(varName));
    
    if (exports[envInfo.constant] = isCI; isCI) {
      exports.name = envInfo.name;

      switch (typeof envInfo.pr) {
        case "string":
          exports.isPR = Boolean(env[envInfo.pr]);
          break;
        case "object":
          if ("env" in envInfo.pr) {
            exports.isPR = envInfo.pr.env in env && env[envInfo.pr.env] !== envInfo.pr.ne;
          } else if ("any" in envInfo.pr) {
            exports.isPR = envInfo.pr.any.some(prEnv => Boolean(env[prEnv]));
          } else {
            exports.isPR = matchesEnvCondition(envInfo.pr);
          }
          break;
        default:
          exports.isPR = null;
      }
    }
  }

  exports.isCI = Boolean(env.CI || env.CONTINUOUS_INTEGRATION || env.BUILD_NUMBER || env.RUN_ID || exports.name);
});

// Global flags and configuration
let isCIMode = envConfig.isCI;
let isDebugMode = false;
let isTTY = false;
let nodeEnv = "development";
let platformName = "";
let minimalLogs = false;

function isTruthy(variable) {
  return variable && variable !== 'false';
}

// Detect platform and terminal features
if (typeof process !== "undefined") {
  if (process.platform) platformName = String(process.platform);
  if (process.stdout) isTTY = isTruthy(process.stdout.isTTY);
  isCIMode = Boolean(envConfig.isCI);
  if (process.env) {
    if (process.env.NODE_ENV) nodeEnv = process.env.NODE_ENV;
    isDebugMode = isTruthy(process.env.DEBUG);
    minimalLogs = isTruthy(process.env.MINIMAL);
  }
}

// Define general environment properties
const envProperties = {
  browser: typeof window !== "undefined",
  test: nodeEnv === "test",
  dev: ["development", "dev"].includes(nodeEnv),
  production: nodeEnv === "production",
  debug: isDebugMode,
  ci: isCIMode,
  tty: isTTY,
  minimal: undefined,
  minimalCLI: undefined,
  windows: /^win/i.test(platformName),
  darwin: /^darwin/i.test(platformName),
  linux: /^linux/i.test(platformName),
};

envProperties.minimal = minimalLogs || envProperties.ci || envProperties.test || !envProperties.tty;
envProperties.minimalCLI = envProperties.minimal;

// Log Levels
const logLevels = {
  Fatal: 0,
  Error: 0,
  Warn: 1,
  Log: 2,
  Info: 3,
  Success: 3,
  Debug: 4,
  Trace: 5,
  Silent: -Infinity,
  Verbose: Infinity,
};

// Default log types
const defaultLogTypes = {
  silent: { level: -1 },
  fatal: { level: logLevels.Fatal },
  error: { level: logLevels.Error },
  warn: { level: logLevels.Warn },
  log: { level: logLevels.Log },
  info: { level: logLevels.Info },
  success: { level: logLevels.Success },
  debug: { level: logLevels.Debug },
  trace: { level: logLevels.Trace },
  verbose: { level: logLevels.Trace },
  ready: { level: logLevels.Info },
  start: { level: logLevels.Info },
};

// Logger class
class Logger {
  constructor(options = {}) {
    this.reporters = options.reporters || [];
    this.types = options.types || defaultLogTypes;
    this.level = options.level !== undefined ? options.level : logLevels.Info;
    this.defaults = options.defaults || {};
    this.asyncMode = options.async !== undefined ? options.async : false;
    this.stdout = options.stdout;
    this.stderr = options.stderr;
    this.mockFn = options.mockFn;
    this.throttle = options.throttle || 1000;
    this.throttleMin = options.throttleMin || 5;

    // Initialize log type methods
    for (const type in this.types) {
      this[type] = this.createLogFn({ type, ...this.types[type], ...this.defaults });
    }

    if (this.mockFn) this.mockLogTypes();

    this.lastLogSerialized = undefined;
    this.lastLog = undefined;
    this.lastLogTime = undefined;
    this.lastLogCount = 0;
    this.throttleTimeout = undefined;
  }

  get stdoutStream() {
    return this.stdout || console._stdout;
  }

  get stderrStream() {
    return this.stderr || console._stderr;
  }

  create(options) {
    return new Logger({
      ...{
        reporters: this.reporters,
        level: this.level,
        types: this.types,
        defaults: this.defaults,
        stdout: this.stdout,
        stderr: this.stderr,
        mockFn: this.mockFn,
      },
      ...options,
    });
  }

  withDefaults(defaults) {
    return this.create({ defaults: { ...this.defaults, ...defaults } });
  }

  withTag(tag) {
    return this.withDefaults({ tag: this.defaults.tag ? `${this.defaults.tag}:${tag}` : tag });
  }

  addReporter(reporter) {
    this.reporters.push(reporter);
    return this;
  }

  removeReporter(reporter) {
    if (reporter) {
      const index = this.reporters.indexOf(reporter);
      if (index >= 0) return this.reporters.splice(index, 1);
    } else {
      this.reporters = [];
    }
    return this;
  }

  setReporters(reporters) {
    this.reporters = Array.isArray(reporters) ? reporters : [reporters];
    return this;
  }

  wrapConsole() {
    for (const type in this.types) {
      if (!console[`__${type}`]) {
        console[`__${type}`] = console[type];
      }
      console[type] = this[type];
    }
  }

  restoreConsole() {
    for (const type in this.types) {
      if (console[`__${type}`]) {
        console[type] = console[`__${type}`];
        delete console[`__${type}`];
      }
    }
  }

  wrapStream(stream, method) {
    if (stream && !stream.__write) {
      stream.__write = stream.write;
      stream.write = (data) => {
        this[method](String(data).trim());
      };
    }
  }

  restoreStream(stream) {
    if (stream && stream.__write) {
      stream.write = stream.__write;
      delete stream.__write;
    }
  }

  mockLogTypes(mockFn) {
    this.mockFn = mockFn || this.mockFn;
    if (typeof this.mockFn === "function") {
      for (const type in this.types) {
        this[type] = this.mockFn(type, this.types[type]) || this[type];
      }
    }
  }

  createLogFn(config) {
    return function () {
      if (arguments && arguments.length) {
        this.logImpl(config, arguments);
      }
    }.bind(this);
  }

  logImpl(logConfig, args) {
    if (logConfig.level > this.level) {
      return this.asyncMode ? Promise.resolve(false) : false;
    }

    // Merge arguments and options for log
    const logObject = { ...logConfig, date: new Date(), args: Array.from(args) };
    if (logObject.message) {
      logObject.args.unshift(logObject.message);
      delete logObject.message;
    }
    // Handle additional log lines
    if (logObject.additional) {
      if (!Array.isArray(logObject.additional)) {
        logObject.additional = logObject.additional.split("\n");
      }
      logObject.args.push("\n" + logObject.additional.join("\n"));
      delete logObject.additional;
    }

    logObject.type = typeof logObject.type === "string" ? logObject.type.toLowerCase() : "";
    logObject.tag = typeof logObject.tag === "string" ? logObject.tag.toLowerCase() : "";

    const executeLog = (finish) => {
      // Handle repeated logs
      const repeatedLogCount = this.lastLogCount - this.throttleMin;
      if (this.lastLog && repeatedLogCount > 0) {
        const repeatedArgs = [...this.lastLog.args];
        if (repeatedLogCount > 1) {
          repeatedArgs.push(`(repeated ${repeatedLogCount} times)`);
        }
        this.logOutput({ ...this.lastLog, args: repeatedArgs });
        this.lastLogCount = 1;
      }
      // Update last log reference
      if (finish) {
        this.lastLog = logObject;
        return this.asyncMode ? this.logOutputAsync(logObject) : this.logOutput(logObject);
      }
    };
    clearTimeout(this.throttleTimeout);

    const elapsedTime = this.lastLogTime ? logObject.date - this.lastLogTime : 0;
    this.lastLogTime = logObject.date;

    if (elapsedTime < this.throttle) {
      try {
        const serializedLog = JSON.stringify([logObject.type, logObject.tag, logObject.args]);
        const isRepeated = this.lastLogSerialized === serializedLog;
        this.lastLogSerialized = serializedLog;
        if (isRepeated) {
          this.lastLogCount++;
          if (this.lastLogCount > this.throttleMin) {
            this.throttleTimeout = setTimeout(executeLog, this.throttle);
            return;
          }
        }
      } catch (error) {
        // Fail silently
      }
    }
    executeLog(true);
  }

  logOutput(log) {
    for (const reporter of this.reporters) {
      reporter.log(log, { async: false, stdout: this.stdoutStream, stderr: this.stderrStream });
    }
  }
  
  logOutputAsync(log) {
    return Promise.all(this.reporters.map(reporter => 
      reporter.log(log, { async: true, stdout: this.stdoutStream, stderr: this.stderrStream })
    ));
  }

  pauseLogs() {
    isCIMode = true;
  }

  resumeLogs() {
    isCIMode = false;
  }
}

// Format classes
class SimpleReporter {
  constructor(options = {}) {
    this.options = { dateFormat: "HH:mm:ss", formatOptions: { date: true, colors: true, compact: true }, ...options };
  }

  formatStack(stack) {
    return stack;
  }

  formatArgs(args) {
    const formatted = args.map(arg => arg.stack ? `${arg.message}\n${this.formatStack(arg.stack)}` : arg);
    return util.format(...formatted);
  }

  formatDate(date) {
    return this.options.formatOptions.date ? date.toISOString().split('T')[1].replace('Z', '') : '';
  }

  formatLogObj(logObject) {
    const formattedArgs = this.formatArgs(logObject.args);
    return `[${logObject.type.toUpperCase()}] ${formattedArgs}`;
  }

  log(logObject, { async, stdout, stderr } = {}) {
    const output = async ? stdout : stderr;
    output.write(this.formatLogObj(logObject) + "\n");
  }
}

// Initialize and export consola
if (!global.consola) {
  const consolaInstance = new Logger();
  consolaInstance.Consola = Logger;
  consolaInstance.SimpleReporter = SimpleReporter;
  global.consola = consolaInstance;
}

module.exports = global.consola;
