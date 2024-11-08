"use strict";

// Utility functions for property and module handling
const {
  defineProperty: __defProp,
  getOwnPropertyDescriptor: __getOwnPropDesc,
  getOwnPropertyNames: __getOwnPropNames,
  create: __create
} = Object;

const __hasOwnProp = Object.prototype.hasOwnProperty;

const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

const __copyProps = (to, from, exclude, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== exclude) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

const __toESM = (mod, nodeMode, target) => (
  target = mod != null ? __create(Object.getPrototypeOf(mod)) : {},
  __copyProps(nodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod)
);

const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var src_exports = {};
__export(src_exports, {
  ANSI_ESCAPE: () => ANSI_ESCAPE,
  ANSI_ESCAPE_CODES: () => ANSI_ESCAPE_CODES,
  BaseEventMap: () => BaseEventMap,
  Concurrency: () => Concurrency,
  DefaultRenderer: () => DefaultRenderer,
  EventManager: () => EventManager,
  LISTR_DEFAULT_RENDERER_STYLE: () => LISTR_DEFAULT_RENDERER_STYLE,
  LISTR_LOGGER_STDERR_LEVELS: () => LISTR_LOGGER_STDERR_LEVELS,
  LISTR_LOGGER_STYLE: () => LISTR_LOGGER_STYLE,
  Listr: () => Listr,
  ListrDefaultRendererLogLevels: () => ListrDefaultRendererLogLevels,
  ListrEnvironmentVariables: () => ListrEnvironmentVariables,
  ListrError: () => ListrError,
  ListrErrorTypes: () => ListrErrorTypes,
  ListrEventManager: () => ListrEventManager,
  ListrEventType: () => ListrEventType,
  ListrLogLevels: () => ListrLogLevels,
  ListrLogger: () => ListrLogger,
  ListrPromptAdapter: () => ListrPromptAdapter,
  ListrRendererError: () => ListrRendererError,
  ListrRendererSelection: () => ListrRendererSelection,
  ListrTaskEventManager: () => ListrTaskEventManager,
  ListrTaskEventType: () => ListrTaskEventType,
  ListrTaskState: () => ListrTaskState,
  PRESET_TIMER: () => PRESET_TIMER,
  PRESET_TIMESTAMP: () => PRESET_TIMESTAMP,
  ProcessOutput: () => ProcessOutput,
  ProcessOutputBuffer: () => ProcessOutputBuffer,
  ProcessOutputStream: () => ProcessOutputStream,
  PromptError: () => PromptError,
  SilentRenderer: () => SilentRenderer,
  SimpleRenderer: () => SimpleRenderer,
  Spinner: () => Spinner,
  TestRenderer: () => TestRenderer,
  TestRendererSerializer: () => TestRendererSerializer,
  VerboseRenderer: () => VerboseRenderer,
  assertFunctionOrSelf: () => assertFunctionOrSelf,
  cleanseAnsi: () => cleanseAnsi,
  cloneObject: () => cloneObject,
  color: () => color,
  createWritable: () => createWritable,
  delay: () => delay,
  figures: () => figures,
  getRenderer: () => getRenderer,
  getRendererClass: () => getRendererClass,
  indent: () => indent,
  isObservable: () => isObservable,
  isReadable: () => isReadable,
  isUnicodeSupported: () => isUnicodeSupported,
  parseTimer: () => parseTimer,
  parseTimestamp: () => parseTimestamp,
  splat: () => splat
});
module.exports = __toCommonJS(src_exports);

// Constants for ANSI escape codes
const ANSI_ESCAPE = "\x1B[";
const ANSI_ESCAPE_CODES = {
  CURSOR_HIDE: ANSI_ESCAPE + "?25l",
  CURSOR_SHOW: ANSI_ESCAPE + "?25h"
};

// Constants and Enums
const ListrEnvironmentVariables = {
  FORCE_UNICODE: "LISTR_FORCE_UNICODE",
  FORCE_TTY: "LISTR_FORCE_TTY",
  DISABLE_COLOR: "NO_COLOR",
  FORCE_COLOR: "FORCE_COLOR"
};

const ListrErrorTypes = {
  WILL_RETRY: "WILL_RETRY",
  WILL_ROLLBACK: "WILL_ROLLBACK",
  HAS_FAILED_TO_ROLLBACK: "HAS_FAILED_TO_ROLLBACK",
  HAS_FAILED: "HAS_FAILED",
  HAS_FAILED_WITHOUT_ERROR: "HAS_FAILED_WITHOUT_ERROR"
};

const ListrEventType = {
  SHOULD_REFRESH_RENDER: "SHOULD_REFRESH_RENDER"
};

const ListrRendererSelection = {
  PRIMARY: "PRIMARY",
  SECONDARY: "SECONDARY",
  SILENT: "SILENT"
};

const ListrTaskEventType = {
  TITLE: "TITLE",
  STATE: "STATE",
  ENABLED: "ENABLED",
  SUBTASK: "SUBTASK",
  PROMPT: "PROMPT",
  OUTPUT: "OUTPUT",
  MESSAGE: "MESSAGE",
  CLOSED: "CLOSED"
};

const ListrTaskState = {
  WAITING: "WAITING",
  STARTED: "STARTED",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  SKIPPED: "SKIPPED",
  ROLLING_BACK: "ROLLING_BACK",
  ROLLED_BACK: "ROLLED_BACK",
  RETRY: "RETRY",
  PAUSED: "PAUSED",
  PROMPT: "PROMPT",
  PROMPT_COMPLETED: "PROMPT_COMPLETED",
  PROMPT_FAILED: "PROMPT_FAILED"
};

// Custom Event Manager classes
class EventManager {
  emitter = new (require("eventemitter3"))();
  emit(event, args) {
    this.emitter.emit(event, args);
  }
  on(event, handler) {
    this.emitter.addListener(event, handler);
  }
  once(event, handler) {
    this.emitter.once(event, handler);
  }
  off(event, handler) {
    this.emitter.off(event, handler);
  }
  complete() {
    this.emitter.removeAllListeners();
  }
}

class BaseEventMap {
  static { __name(this, "BaseEventMap"); }
}

// Utility functions
function isObservable(obj) {
  return !!obj && typeof obj === "object" && typeof obj.subscribe === "function";
}

function isReadable(obj) {
  return !!obj && typeof obj === "object" && obj.readable === true && typeof obj.read === "function" && typeof obj.on === "function";
}

function isUnicodeSupported() {
  return !!process.env["LISTR_FORCE_UNICODE"] || process.platform !== "win32" || !!process.env.CI || !!process.env.WT_SESSION || process.env.TERM_PROGRAM === "vscode" || process.env.TERM === "xterm-256color" || process.env.TERM === "alacritty";
}

// ANSI cleansing utilities
const CLEAR_LINE_REGEX = "(?:\\u001b|\\u009b)\\[[\\=><~/#&.:=?%@~_-]*[0-9]*[\\a-ln-tqyz=><~/#&.:=?%@~_-]+";
const BELL_REGEX = /\u0007/;

function cleanseAnsi(chunk) {
  return String(chunk).replace(new RegExp(CLEAR_LINE_REGEX, "gmi"), "").replace(new RegExp(BELL_REGEX, "gmi"), "").trim();
}

// Color and formatting utilities
const { createColors } = require("colorette");
const color = createColors();

function indent(string, count) {
  return string.replace(/^(?!\s*$)/gm, " ".repeat(count));
}

const FIGURES_MAIN = {
  warning: "\u26A0",
  cross: "\u2716",
  arrowDown: "\u2193",
  tick: "\u2714",
  arrowRight: "\u2192",
  pointer: "\u276F",
  checkboxOn: "\u2612",
  arrowLeft: "\u2190",
  squareSmallFilled: "\u25FC",
  pointerSmall: "\u203A"
};

const FIGURES_FALLBACK = {
  ...FIGURES_MAIN,
  warning: "\u203C",
  cross: "✗",
  tick: "√",
  pointer: ">",
  checkboxOn: "[✗]",
  squareSmallFilled: "■"
};

const figures = isUnicodeSupported() ? FIGURES_MAIN : FIGURES_FALLBACK;
const { format } = require("util");

function splat(message, ...splat) {
  return format(String(message), ...splat);
}

// Logger constants
const ListrLogLevels = {
  STARTED: "STARTED",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  SKIPPED: "SKIPPED",
  OUTPUT: "OUTPUT",
  TITLE: "TITLE",
  ROLLBACK: "ROLLBACK",
  RETRY: "RETRY",
  PROMPT: "PROMPT",
  PAUSED: "PAUSED"
};

const LISTR_LOGGER_STYLE = {
  icon: {
    [ListrLogLevels.STARTED]: figures.pointer,
    [ListrLogLevels.FAILED]: figures.cross,
    [ListrLogLevels.SKIPPED]: figures.arrowDown,
    [ListrLogLevels.COMPLETED]: figures.tick,
    [ListrLogLevels.OUTPUT]: figures.pointerSmall,
    [ListrLogLevels.TITLE]: figures.arrowRight,
    [ListrLogLevels.RETRY]: figures.warning,
    [ListrLogLevels.ROLLBACK]: figures.arrowLeft,
    [ListrLogLevels.PAUSED]: figures.squareSmallFilled
  },
  color: {
    [ListrLogLevels.STARTED]: color.yellow,
    [ListrLogLevels.FAILED]: color.red,
    [ListrLogLevels.SKIPPED]: color.yellow,
    [ListrLogLevels.COMPLETED]: color.green,
    [ListrLogLevels.RETRY]: color.yellowBright,
    [ListrLogLevels.ROLLBACK]: color.redBright,
    [ListrLogLevels.PAUSED]: color.yellowBright
  }
};

const LISTR_LOGGER_STDERR_LEVELS = ["RETRY", "ROLLBACK", "FAILED"];

// Logger and process output classes
const os = require("os");

class ListrLogger {
  constructor(options = {}) {
    this.options = {
      useIcons: true,
      toStderr: [],
      ...options
    };
    this.options.fields ??= {};
    this.options.fields.prefix ??= [];
    this.options.fields.suffix ??= [];
    this.process = this.options.processOutput ?? new ProcessOutput();
  }
  
  process;

  log(level, message, options) {
    const output = this.format(level, message, options);
    if (this.options.toStderr.includes(level)) {
      this.process.toStderr(output);
      return;
    }
    this.process.toStdout(output);
  }

  toStdout(message, options, eol = true) {
    this.process.toStdout(this.format(null, message, options), eol);
  }

  toStderr(message, options, eol = true) {
    this.process.toStderr(this.format(null, message, options), eol);
  }

  wrap(message, options) {
    if (!message) {
      return message;
    }
    return this.applyFormat(`[${message}]`, options);
  }

  splat(...args) {
    const message = args.shift() ?? "";
    return args.length === 0 ? message : splat(message, args);
  }

  suffix(message, ...suffixes) {
    suffixes.filter(Boolean).forEach((suffix) => {
      message += this.spacing(message);
      if (typeof suffix === "string") {
        message += this.wrap(suffix);
      } else if (typeof suffix === "object") {
        suffix.args ??= [];
        if (typeof suffix.condition === "function" ? !suffix.condition(...suffix.args) : !(suffix.condition ?? true)) {
          return message;
        }
        message += this.wrap(typeof suffix.field === "function" ? suffix.field(...suffix.args) : suffix.field, {
          format: suffix?.format(...suffix.args)
        });
      }
    });
    return message;
  }

  prefix(message, ...prefixes) {
    prefixes.filter(Boolean).forEach((prefix) => {
      message = this.spacing(message) + message;
      if (typeof prefix === "string") {
        message = this.wrap(prefix) + message;
      } else if (typeof prefix === "object") {
        prefix.args ??= [];
        if (typeof prefix.condition === "function" ? !prefix.condition(...prefix.args) : !(prefix.condition ?? true)) {
          return message;
        }
        message = this.wrap(typeof prefix.field === "function" ? prefix.field(...prefix.args) : prefix.field, {
          format: prefix?.format()
        }) + message;
      }
    });
    return message;
  }

  fields(message, options) {
    if (this.options?.fields?.prefix) {
      message = this.prefix(message, ...this.options.fields.prefix);
    }
    if (options?.prefix) {
      message = this.prefix(message, ...options.prefix);
    }
    if (options?.suffix) {
      message = this.suffix(message, ...options.suffix);
    }
    if (this.options?.fields?.suffix) {
      message = this.suffix(message, ...this.options.fields.suffix);
    }
    return message;
  }

  icon(level, icon) {
    if (!level) {
      return null;
    }
    icon ||= this.options.icon?.[level];
    const coloring = this.options.color?.[level];
    if (icon && coloring) {
      icon = coloring(icon);
    }
    return icon;
  }

  format(level, message, options) {
    if (!Array.isArray(message)) {
      message = [message];
    }
    message = this.splat(message.shift(), ...message).toString().split(os.EOL).filter((m) => !m || m.trim() !== "").map((m) => {
      return this.style(
        level,
        this.fields(m, {
          prefix: Array.isArray(options?.prefix) ? options.prefix : [options?.prefix],
          suffix: Array.isArray(options?.suffix) ? options.suffix : [options?.suffix]
        })
      );
    }).join(os.EOL);
    return message;
  }

  style(level, message) {
    if (!level || !message) {
      return message;
    }
    const icon = this.icon(level, !this.options.useIcons && this.wrap(level));
    if (icon) {
      message = icon + " " + message;
    }
    return message;
  }

  applyFormat(message, options) {
    if (options?.format) {
      return options.format(message);
    }
    return message;
  }

  spacing(message) {
    return typeof message === "undefined" || message.trim() === "" ? "" : " ";
  }
}

class ProcessOutputBuffer {
  constructor(options) {
    this.options = options;
  }

  buffer = [];
  decoder = new (require("string_decoder").StringDecoder)();

  // Getter methods
  get all() {
    return this.buffer;
  }
  get last() {
    return this.buffer.at(-1);
  }
  get length() {
    return this.buffer.length;
  }

  write(data, ...args) {
    const callback = args[args.length - 1];
    this.buffer.push({
      time: Date.now(),
      stream: this.options?.stream,
      entry: this.decoder.write(typeof data === "string" ? Buffer.from(data, typeof args[0] === "string" ? args[0] : void 0) : Buffer.from(data))
    });
    if (this.options?.limit) {
      this.buffer = this.buffer.slice(-this.options.limit);
    }
    if (typeof callback === "function") {
      callback();
    }
    return true;
  }

  reset() {
    this.buffer = [];
  }
}

class ProcessOutputStream {
  constructor(stream) {
    this.stream = stream;
    this.method = stream.write;
    this.buffer = new ProcessOutputBuffer({ 
      stream: stream 
    });
  }

  method;
  buffer;

  get out() {
    return Object.assign({}, this.stream, {
      write: this.write.bind(this)
    });
  }

  hijack() {
    this.stream.write = this.buffer.write.bind(this.buffer);
  }

  release() {
    this.stream.write = this.method;
    const buffer = [...this.buffer.all];
    this.buffer.reset();
    return buffer;
  }

  write(...args) {
    return this.method.apply(this.stream, args);
  }
}

class ProcessOutput {
  constructor(stdout, stderr, options) {
    this.options = options;
    this.stream = {
      stdout: new ProcessOutputStream(stdout ?? process.stdout),
      stderr: new ProcessOutputStream(stderr ?? process.stderr)
    };
    this.options = {
      dump: ["stdout", "stderr"],
      leaveEmptyLine: true,
      ...options
    };
  }

  stream;
  active;

  get stdout() {
    return this.stream.stdout.out;
  }

  get stderr() {
    return this.stream.stderr.out;
  }

  hijack() {
    if (this.active) {
      throw new Error("ProcessOutput has been already hijacked!");
    }
    this.stream.stdout.write(ANSI_ESCAPE_CODES.CURSOR_HIDE);
    Object.values(this.stream).forEach((stream) => stream.hijack());
    this.active = true;
  }

  release() {
    const output = Object.entries(this.stream).map(([name, stream]) => ({ name, buffer: stream.release() })).filter((output) => this.options.dump.includes(output.name)).flatMap((output) => output.buffer).sort((a, b) => a.time - b.time).map((message) => {
      return { ...message, entry: cleanseAnsi(message.entry) };
    }).filter((message) => message.entry);

    if (output.length > 0) {
      if (this.options.leaveEmptyLine) {
        this.stdout.write(os.EOL);
      }
      output.forEach((message) => {
        const stream = message.stream ?? this.stdout;
        stream.write(message.entry + os.EOL);
      });
    }

    this.stream.stdout.write(ANSI_ESCAPE_CODES.CURSOR_SHOW);
    this.active = false;
  }

  toStdout(buffer, eol = true) {
    if (eol) {
      buffer = buffer + os.EOL;
    }
    return this.stream.stdout.write(buffer);
  }

  toStderr(buffer, eol = true) {
    if (eol) {
      buffer = buffer + os.EOL;
    }
    return this.stream.stderr.write(buffer);
  }
}

// Writable stream utility
const { Writable } = require("stream");

function createWritable(callback) {
  const writable = new Writable();
  writable.rows = Infinity;
  writable.columns = Infinity;
  writable.write = (chunk) => {
    callback(chunk.toString());
    return true;
  };
  return writable;
}

// Adapter class for prompt handling
class ListrPromptAdapter {
  constructor(task, wrapper) {
    this.task = task;
    this.wrapper = wrapper;
  }

  state;

  reportStarted() {
    this.state = this.task.state;
    if (this.task.prompt) {
      throw new PromptError("There is already an active prompt attached to this task which may not be cleaned up properly.");
    }
    this.task.prompt = this;
    this.task.state$ = "PROMPT";
  }

  reportFailed() {
    this.task.state$ = "PROMPT_FAILED";
    this.restoreState();
  }

  reportCompleted() {
    this.task.state$ = "PROMPT_COMPLETED";
    this.restoreState();
  }

  restoreState() {
    this.task.prompt = void 0;
    if (this.state) {
      this.task.state = this.state;
    }
  }
}

// Spinner class for async operation visualization
class Spinner {
  spinner = !isUnicodeSupported() ? ["-", "\\", "|", "/"] : ["⡋", "⢙", "⣙", "⣈", "⣜", "⣔", "⢖", "⢇", "⡇", "⡏"];
  id;
  spinnerPosition = 0;

  spin() {
    this.spinnerPosition = ++this.spinnerPosition % this.spinner.length;
  }

  fetch() {
    return this.spinner[this.spinnerPosition];
  }

  isRunning() {
    return !!this.id;
  }

  start(callback, interval = 100) {
    this.id = setInterval(() => {
      this.spin();
      if (callback) {
        callback();
      }
    }, interval);
  }

  stop() {
    clearInterval(this.id);
  }
}

// Constants for renderers
const ListrDefaultRendererLogLevels = {
  SKIPPED_WITH_COLLAPSE: "SKIPPED_WITH_COLLAPSE",
  SKIPPED_WITHOUT_COLLAPSE: "SKIPPED_WITHOUT_COLLAPSE",
  OUTPUT: "OUTPUT",
  OUTPUT_WITH_BOTTOMBAR: "OUTPUT_WITH_BOTTOMBAR",
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  COMPLETED_WITH_FAILED_SUBTASKS: "COMPLETED_WITH_FAILED_SUBTASKS",
  COMPLETED_WITH_FAILED_SISTER_TASKS: "COMPLETED_WITH_SISTER_TASKS_FAILED",
  RETRY: "RETRY",
  ROLLING_BACK: "ROLLING_BACK",
  ROLLED_BACK: "ROLLED_BACK",
  FAILED: "FAILED",
  FAILED_WITH_FAILED_SUBTASKS: "FAILED_WITH_SUBTASKS",
  WAITING: "WAITING",
  PAUSED: "PAUSED"
};

const LISTR_DEFAULT_RENDERER_STYLE = {
  icon: {
    ["SKIPPED_WITH_COLLAPSE"]: figures.arrowDown,
    ["SKIPPED_WITHOUT_COLLAPSE"]: figures.warning,
    ["OUTPUT"]: figures.pointerSmall,
    ["OUTPUT_WITH_BOTTOMBAR"]: figures.pointerSmall,
    ["PENDING"]: figures.pointer,
    ["COMPLETED"]: figures.tick,
    ["COMPLETED_WITH_FAILED_SUBTASKS"]: figures.warning,
    ["COMPLETED_WITH_SISTER_TASKS_FAILED"]: figures.squareSmallFilled,
    ["RETRY"]: figures.warning,
    ["ROLLING_BACK"]: figures.warning,
    ["ROLLED_BACK"]: figures.arrowLeft,
    ["FAILED"]: figures.cross,
    ["FAILED_WITH_SUBTASKS"]: figures.pointer,
    ["WAITING"]: figures.squareSmallFilled,
    ["PAUSED"]: figures.squareSmallFilled
  },
  color: {
    ["SKIPPED_WITH_COLLAPSE"]: color.yellow,
    ["SKIPPED_WITHOUT_COLLAPSE"]: color.yellow,
    ["PENDING"]: color.yellow,
    ["COMPLETED"]: color.green,
    ["COMPLETED_WITH_FAILED_SUBTASKS"]: color.yellow,
    ["COMPLETED_WITH_SISTER_TASKS_FAILED"]: color.red,
    ["RETRY"]: color.yellowBright,
    ["ROLLING_BACK"]: color.redBright,
    ["ROLLED_BACK"]: color.redBright,
    ["FAILED"]: color.red,
    ["FAILED_WITH_SUBTASKS"]: color.red,
    ["WAITING"]: color.dim,
    ["PAUSED"]: color.yellowBright
  }
};

// Default Renderer Class
const { createLogUpdate } = require("log-update");
const truncate = require("cli-truncate");
const wrapAnsi = require("wrap-ansi");

class DefaultRenderer {
  constructor(tasks, options, events) {
    this.tasks = tasks;
    this.options = options;
    this.events = events;
    this.options = {
      ...DefaultRenderer.rendererOptions,
      ...this.options,
      icon: {
        ...LISTR_DEFAULT_RENDERER_STYLE.icon,
        ...options?.icon ?? {}
      },
      color: {
        ...LISTR_DEFAULT_RENDERER_STYLE.color,
        ...options?.color ?? {}
      }
    };
    this.spinner = this.options.spinner ?? new Spinner();
    this.logger = this.options.logger ?? new ListrLogger({ useIcons: true, toStderr: [] });
    this.logger.options.icon = this.options.icon;
    this.logger.options.color = this.options.color;
  }

  static nonTTY = false;
  static rendererOptions = {
    indentation: 2,
    clearOutput: false,
    showSubtasks: true,
    collapseSubtasks: true,
    collapseSkips: true,
    showSkipMessage: true,
    suffixSkips: false,
    collapseErrors: true,
    showErrorMessage: true,
    suffixRetries: true,
    lazy: false,
    removeEmptyLines: true,
    formatOutput: "wrap",
    pausedTimer: {
      ...PRESET_TIMER,
      format: () => color.yellowBright
    }
  };

  static rendererTaskOptions = {
    outputBar: true
  };

  prompt;
  activePrompt;
  spinner;
  logger;
  updater;
  truncate;
  wrap;
  buffer = {
    output: new Map(),
    bottom: new Map()
  };

  cache = {
    render: new Map(),
    rendererOptions: new Map(),
    rendererTaskOptions: new Map()
  };

  async render() {
    const { createLogUpdate } = await import("log-update");
    this.updater = createLogUpdate(this.logger.process.stdout);
    this.truncate = truncate;
    this.wrap = wrapAnsi;
    this.logger.process.hijack();
    if (!this.options?.lazy) {
      this.spinner.start(() => {
        this.update();
      });
    }
    this.events.on("SHOULD_REFRESH_RENDER", () => {
      this.update();
    });
  }

  update() {
    this.updater(this.create());
  }

  end() {
    this.spinner.stop();
    this.updater.clear();
    this.updater.done();
    if (!this.options.clearOutput) {
      this.logger.process.toStdout(this.create({ prompt: false }));
    }
    this.logger.process.release();
  }

  create(options) {
    options = {
      tasks: true,
      bottomBar: true,
      prompt: true,
      ...options
    };
    const render = [];
    const renderTasks = this.renderer(this.tasks);
    const renderBottomBar = this.renderBottomBar();
    const renderPrompt = this.renderPrompt();
    if (options.tasks && renderTasks.length > 0) {
      render.push(...renderTasks);
    }
    if (options.bottomBar && renderBottomBar.length > 0) {
      if (render.length > 0) {
        render.push("");
      }
      render.push(...renderBottomBar);
    }
    if (options.prompt && renderPrompt.length > 0) {
      if (render.length > 0) {
        render.push("");
      }
      render.push(...renderPrompt);
    }
    return render.join(os.EOL);
  }

  // eslint-disable-next-line complexity
  style(task, output = false) {
    const rendererOptions = this.cache.rendererOptions.get(task.id);
    if (task.isSkipped()) {
      if (output || rendererOptions.collapseSkips) {
        return this.logger.icon("SKIPPED_WITH_COLLAPSE");
      } else if (rendererOptions.collapseSkips === false) {
        return this.logger.icon("SKIPPED_WITHOUT_COLLAPSE");
      }
    }
    if (output) {
      if (this.shouldOutputToBottomBar(task)) {
        return this.logger.icon("OUTPUT_WITH_BOTTOMBAR");
      }
      return this.logger.icon("OUTPUT");
    }
    if (task.hasSubtasks()) {
      if (task.isStarted() || task.isPrompt() && rendererOptions.showSubtasks !== false && !task.subtasks.every((subtask) => !subtask.hasTitle())) {
        return this.logger.icon("PENDING");
      } else if (task.isCompleted() && task.subtasks.some((subtask) => subtask.hasFailed())) {
        return this.logger.icon("COMPLETED_WITH_FAILED_SUBTASKS");
      } else if (task.hasFailed()) {
        return this.logger.icon("FAILED_WITH_SUBTASKS");
      }
    }
    if (task.isStarted() || task.isPrompt()) {
      return this.logger.icon("PENDING", !this.options?.lazy && this.spinner.fetch());
    } else if (task.isCompleted()) {
      return this.logger.icon("COMPLETED");
    } else if (task.isRetrying()) {
      return this.logger.icon("RETRY", !this.options?.lazy && this.spinner.fetch());
    } else if (task.isRollingBack()) {
      return this.logger.icon("ROLLING_BACK", !this.options?.lazy && this.spinner.fetch());
    } else if (task.hasRolledBack()) {
      return this.logger.icon("ROLLED_BACK");
    } else if (task.hasFailed()) {
      return this.logger.icon("FAILED");
    } else if (task.isPaused()) {
      return this.logger.icon("PAUSED");
    }
    return this.logger.icon("WAITING");
  }

  format(message, icon, level) {
    if (message.trim() === "") {
      return [];
    }
    if (icon) {
      message = icon + " " + message;
    }
    let parsed;
    const columns = (process.stdout.columns ?? 80) - level * this.options.indentation - 2;
    switch (this.options.formatOutput) {
      case "truncate":
        parsed = message.split(os.EOL).map((s, i) => {
          return this.truncate(this.indent(s, i), columns);
        });
        break;
      case "wrap":
        parsed = this.wrap(message, columns, { hard: true }).split(os.EOL).map((s, i) => this.indent(s, i));
        break;
      default:
        throw new ListrRendererError("Format option for the renderer is wrong.");
    }
    if (this.options.removeEmptyLines) {
      parsed = parsed.filter(Boolean);
    }
    return parsed.map((str) => indent(str, level * this.options.indentation));
  }

  shouldOutputToOutputBar(task) {
    const outputBar = this.cache.rendererTaskOptions.get(task.id).outputBar;
    return typeof outputBar === "number" && outputBar !== 0 || typeof outputBar === "boolean" && outputBar !== false;
  }

  shouldOutputToBottomBar(task) {
    const bottomBar = this.cache.rendererTaskOptions.get(task.id).bottomBar;
    return typeof bottomBar === "number" && bottomBar !== 0 || typeof bottomBar === "boolean" && bottomBar !== false || !task.hasTitle();
  }

  renderer(tasks, level = 0) {
    return tasks.flatMap((task) => {
      if (!task.isEnabled()) {
        return [];
      }
      if (this.cache.render.has(task.id)) {
        return this.cache.render.get(task.id);
      }
      this.calculate(task);
      this.setupBuffer(task);
      const rendererOptions = this.cache.rendererOptions.get(task.id);
      const rendererTaskOptions = this.cache.rendererTaskOptions.get(task.id);
      const output = [];
      if (task.isPrompt()) {
        if (this.activePrompt && this.activePrompt !== task.id) {
          throw new ListrRendererError("Only one prompt can be active at the given time, please re-evaluate your task design.");
        } else if (!this.activePrompt) {
          task.on("PROMPT", (prompt) => {
            const cleansed = cleanseAnsi(prompt);
            if (cleansed) {
              this.prompt = cleansed;
            }
          });
          task.on("STATE", (state) => {
            if (state === "PROMPT_COMPLETED" || task.hasFinalized() || task.hasReset()) {
              this.prompt = null;
              this.activePrompt = null;
              task.off("PROMPT");
            }
          });
          this.activePrompt = task.id;
        }
      }
      if (task.hasTitle()) {
        if (!(tasks.some((task2) => task2.hasFailed()) && !task.hasFailed() && task.options.exitOnError !== false && !(task.isCompleted() || task.isSkipped()))) {
          if (task.hasFailed() && rendererOptions.collapseErrors) {
            output.push(...this.format(!task.hasSubtasks() && task.message.error && rendererOptions.showErrorMessage ? task.message.error : task.title, this.style(task), level));
          } else if (task.isSkipped() && rendererOptions.collapseSkips) {
            output.push(
              ...this.format(
                this.logger.suffix(task.message.skip && rendererOptions.showSkipMessage ? task.message.skip : task.title, {
                  field: "SKIPPED",
                  condition: rendererOptions.suffixSkips,
                  format: () => color.dim
                }),
                this.style(task),
                level
              )
            );
          } else if (task.isRetrying()) {
            output.push(
              ...this.format(
                this.logger.suffix(task.title, {
                  field: `${"RETRY"}:${task.message.retry.count}`,
                  format: () => color.yellow,
                  condition: rendererOptions.suffixRetries
                }),
                this.style(task),
                level
              )
            );
          } else if (task.isCompleted() && task.hasTitle() && assertFunctionOrSelf(rendererTaskOptions.timer?.condition, task.message.duration)) {
            output.push(
              ...this.format(
                this.logger.suffix(task?.title, {
                  ...rendererTaskOptions.timer,
                  args: [task.message.duration]
                }),
                this.style(task),
                level
              )
            );
          } else if (task.isPaused()) {
            output.push(
              ...this.format(
                this.logger.suffix(task.title, {
                  ...rendererOptions.pausedTimer,
                  args: [task.message.paused - Date.now()]
                }),
                this.style(task),
                level
              )
            );
          } else {
            output.push(...this.format(task.title, this.style(task), level));
          }
        } else {
          output.push(...this.format(task.title, this.logger.icon("COMPLETED_WITH_SISTER_TASKS_FAILED"), level));
        }
      }
      if (!task.hasSubtasks() || !rendererOptions.showSubtasks) {
        if (task.hasFailed() && rendererOptions.collapseErrors === false && (rendererOptions.showErrorMessage || !rendererOptions.showSubtasks)) {
          output.push(...this.dump(task, level, "FAILED"));
        } else if (task.isSkipped() && rendererOptions.collapseSkips === false && (rendererOptions.showSkipMessage || !rendererOptions.showSubtasks)) {
          output.push(...this.dump(task, level, "SKIPPED"));
        }
      }
      if (task.isPending() || rendererTaskOptions.persistentOutput) {
        output.push(...this.renderOutputBar(task, level));
      }
      if (rendererOptions.showSubtasks !== false && task.hasSubtasks() && (task.isPending() || task.hasFinalized() && !task.hasTitle() || task.isCompleted() && rendererOptions.collapseSubtasks === false && !task.subtasks.some((subtask) => this.cache.rendererOptions.get(subtask.id)?.collapseSubtasks === true) || task.subtasks.some((subtask) => this.cache.rendererOptions.get(subtask.id)?.collapseSubtasks === false) || task.subtasks.some((subtask) => subtask.hasFailed()) || task.subtasks.some((subtask) => subtask.hasRolledBack()))) {
        const subtaskLevel = !task.hasTitle() ? level : level + 1;
        const subtaskRender = this.renderer(task.subtasks, subtaskLevel);
        output.push(...subtaskRender);
      }
      if (task.hasFinalized()) {
        if (!rendererTaskOptions.persistentOutput) {
          this.buffer.bottom.delete(task.id);
          this.buffer.output.delete(task.id);
        }
      }
      if (task.isClosed()) {
        this.cache.render.set(task.id, output);
        this.reset(task);
      }
      return output;
    });
  }

  renderOutputBar(task, level) {
    const output = this.buffer.output.get(task.id);
    if (!output) {
      return [];
    }
    return output.all.flatMap((o) => this.dump(task, level, "OUTPUT", o.entry));
  }

  renderBottomBar() {
    if (this.buffer.bottom.size === 0) {
      return [];
    }
    return Array.from(this.buffer.bottom.values()).flatMap((output) => output.all).sort((a, b) => a.time - b.time).map((output) => output.entry);
  }

  renderPrompt() {
    if (!this.prompt) {
      return [];
    }
    return [this.prompt];
  }

  calculate(task) {
    if (this.cache.rendererOptions.has(task.id) && this.cache.rendererTaskOptions.has(task.id)) {
      return;
    }
    const rendererOptions = {
      ...this.options,
      ...task.rendererOptions
    };
    this.cache.rendererOptions.set(task.id, rendererOptions);
    this.cache.rendererTaskOptions.set(task.id, { ...DefaultRenderer.rendererTaskOptions, timer: rendererOptions.timer, ...task.rendererTaskOptions });
  }

  setupBuffer(task) {
    if (this.buffer.bottom.has(task.id) || this.buffer.output.has(task.id)) {
      return;
    }
    const rendererTaskOptions = this.cache.rendererTaskOptions.get(task.id);
    if (this.shouldOutputToBottomBar(task) && !this.buffer.bottom.has(task.id)) {
      this.buffer.bottom.set(task.id, new ProcessOutputBuffer({ limit: typeof rendererTaskOptions.bottomBar === "number" ? rendererTaskOptions.bottomBar : 1 }));
      task.on("OUTPUT", (output) => {
        const data = this.dump(task, -1, "OUTPUT", output);
        this.buffer.bottom.get(task.id).write(data.join(os.EOL));
      });
      task.on("STATE", (state) => {
        switch (state) {
          case "RETRY":
          case "ROLLING_BACK":
            this.buffer.bottom.delete(task.id);
            break;
        }
      });
    } else if (this.shouldOutputToOutputBar(task) && !this.buffer.output.has(task.id)) {
      this.buffer.output.set(task.id, new ProcessOutputBuffer({ limit: typeof rendererTaskOptions.outputBar === "number" ? rendererTaskOptions.outputBar : 1 }));
      task.on("OUTPUT", (output) => {
        this.buffer.output.get(task.id).write(output);
      });
      task.on("STATE", (state) => {
        switch (state) {
          case "RETRY":
          case "ROLLING_BACK":
            this.buffer.output.delete(task.id);
            break;
        }
      });
    }
  }

  reset(task) {
    this.cache.rendererOptions.delete(task.id);
    this.cache.rendererTaskOptions.delete(task.id);
    this.buffer.output.delete(task.id);
  }

  dump(task, level, source = "OUTPUT", data) {
    if (!data) {
      switch (source) {
        case "OUTPUT":
          data = task.output;
          break;
        case "SKIPPED":
          data = task.message.skip;
          break;
        case "FAILED":
          data = task.message.error;
          break;
      }
    }
    if (task.hasTitle() && source === "FAILED" && data === task.title || typeof data !== "string") {
      return [];
    }
    if (source === "OUTPUT") {
      data = cleanseAnsi(data);
    }
    return this.format(data, this.style(task, true), level + 1);
  }

  indent(str, i) {
    return i > 0 ? indent(str.trim(), this.options.indentation) : str.trim();
  }
}

// Silent Renderer class
class SilentRenderer {
  constructor(tasks, options) {
    this.tasks = tasks;
    this.options = options;
  }

  static nonTTY = true;
  static rendererOptions;
  static rendererTaskOptions;

  render() {
    return;
  }

  end() {
    return;
  }
}

// Other renderer implementations (Simple, Verbose, etc.) omitted for brevity

// Parser and Timer Utilities
function parseTimer(duration) {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  let parsedTime;
  if (seconds === 0 && minutes === 0) {
    parsedTime = `0.${Math.floor(duration / 100)}s`;
  }
  if (seconds > 0) {
    parsedTime = `${seconds % 60}s`;
  }
  if (minutes > 0) {
    parsedTime = `${minutes}m${parsedTime}`;
  }
  return parsedTime;
}

const PRESET_TIMER = {
  condition: true,
  field: parseTimer,
  format: () => color.dim
};

function parseTimestamp() {
  const now = new Date();
  return String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0") + ":" + String(now.getSeconds()).padStart(2, "0");
}

const PRESET_TIMESTAMP = {
  condition: true,
  field: parseTimestamp,
  format: () => color.dim
};

// Asynchronous Operations and Concurrency Handling
class Concurrency {
  constructor(options) {
    this.concurrency = options.concurrency;
    this.count = 0;
    this.queue = new Set();
  }

  add(fn) {
    if (this.count < this.concurrency) {
      return this.run(fn);
    }
    return new Promise((resolve) => {
      const callback = () => resolve(this.run(fn));
      this.queue.add(callback);
    });
  }

  flush() {
    for (const callback of this.queue) {
      if (this.count >= this.concurrency) {
        break;
      }
      this.queue.delete(callback);
      callback();
    }
  }

  run(fn) {
    this.count++;
    const promise = fn();
    const cleanup = () => {
      this.count--;
      this.flush();
    };
    promise.then(cleanup, () => {
      this.queue.clear();
    });
    return promise;
  }
}

function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

// Core Task and Listr Management
function getRendererClass(renderer) {
  if (typeof renderer === "string") {
    return RENDERERS[renderer] ?? RENDERERS.default;
  }
  return typeof renderer === "function" ? renderer : RENDERERS.default;
}

function getRenderer(options) {
  if (assertFunctionOrSelf(options?.silentRendererCondition)) {
    return { renderer: getRendererClass("silent"), selection: "SILENT" };
  }
  const r = {
    renderer: getRendererClass(options.renderer),
    options: options.rendererOptions,
    selection: "PRIMARY"
  };
  if (!isRendererSupported(r.renderer) || assertFunctionOrSelf(options?.fallbackRendererCondition)) {
    return {
      renderer: getRendererClass(options.fallbackRenderer),
      options: options.fallbackRendererOptions,
      selection: "SECONDARY"
    };
  }
  return r;
}

function assertFunctionOrSelf(functionOrSelf, ...args) {
  if (typeof functionOrSelf === "function") {
    return functionOrSelf(...args);
  } else {
    return functionOrSelf;
  }
}

const clone = require("rfdc")({ circles: true });

function cloneObject(obj) {
  return clone(obj);
}

// Error Handling Classes
class ListrError extends Error {
  constructor(error, type, task) {
    super(error.message);
    this.error = error;
    this.type = type;
    this.task = task;
    this.name = "ListrError";
    this.path = task.path;
    if (task?.options.collectErrors === "full") {
      this.task = cloneObject(task);
      this.ctx = cloneObject(task.listr.ctx);
    }
    this.stack = error?.stack;
  }
}

class ListrRendererError extends Error {}

class PromptError extends Error {}

// Task Wrapper for managing individual tasks
class TaskWrapper {
  constructor(task) {
    this.task = task;
  }
  static { __name(this, "TaskWrapper"); }

  get title() {
    return this.task.title;
  }

  set title(title) {
    title = Array.isArray(title) ? title : [title];
    this.task.title$ = splat(title.shift(), ...title);
  }

  get output() {
    return this.task.output;
  }

  set output(output) {
    output = Array.isArray(output) ? output : [output];
    this.task.output$ = splat(output.shift(), ...output);
  }

  set promptOutput(output) {
    this.task.promptOutput$ = output;
  }

  newListr(task, options) {
    let tasks;
    if (typeof task === "function") {
      tasks = task(this);
    } else {
      tasks = task;
    }
    return new Listr(tasks, options, this.task);
  }

  report(error, type) {
    if (this.task.options.collectErrors !== false) {
      this.task.listr.errors.push(new ListrError(error, type, this.task));
    }
    this.task.message$ = { error: error.message ?? this.task?.title };
  }

  skip(message, ...metadata) {
    this.task.state$ = "SKIPPED";
    if (message) {
      this.task.message$ = { skip: message ? splat(message, ...metadata) : this.task?.title };
    }
  }

  isRetrying() {
    return this.task.isRetrying() ? this.task.retry : { count: 0 };
  }

  prompt(adapter) {
    if (this.task.prompt) {
      return this.task.prompt;
    }
    return new adapter(this.task, this);
  }

  stdout(type) {
    return createWritable((chunk) => {
      switch (type) {
        case "PROMPT":
          this.promptOutput = chunk;
          break;
        default:
          this.output = chunk;
      }
    });
  }

  run(ctx) {
    return this.task.run(ctx, this);
  }
}

// Task management class
class Task extends ListrTaskEventManager {
  constructor(listr, task, options, rendererOptions, rendererTaskOptions) {
    super();
    this.listr = listr;
    this.task = task;
    this.options = options;
    this.rendererOptions = rendererOptions;
    this.rendererTaskOptions = rendererTaskOptions;
    if (task.title) {
      const title = Array.isArray(task?.title) ? task.title : [task.title];
      this.title = splat(title.shift(), ...title);
      this.initialTitle = this.title;
    }
    this.taskFn = task.task;
    this.parent = listr.parentTask;
  }

  id = (require("crypto").randomUUID)();
  state = "WAITING";
  subtasks;
  title;
  initialTitle;
  output;
  retry;
  message = {};
  prompt;
  parent;
  enabled;
  taskFn;
  closed;

  set state$(state) {
    this.state = state;
    this.emit("STATE", state);
    if (this.hasSubtasks() && this.hasFailed()) {
      for (const subtask of this.subtasks) {
        if (subtask.state === "STARTED") {
          subtask.state$ = "FAILED";
        }
      }
    }
    this.listr.events.emit("SHOULD_REFRESH_RENDER");
  }

  set output$(data) {
    this.output = data;
    this.emit("OUTPUT", data);
    this.listr.events.emit("SHOULD_REFRESH_RENDER");
  }

  set promptOutput$(data) {
    this.emit("PROMPT", data);
    if (cleanseAnsi(data)) {
      this.listr.events.emit("SHOULD_REFRESH_RENDER");
    }
  }

  set message$(data) {
    this.message = { ...this.message, ...data };
    this.emit("MESSAGE", data);
    this.listr.events.emit("SHOULD_REFRESH_RENDER");
  }

  set title$(title) {
    this.title = title;
    this.emit("TITLE", title);
    this.listr.events.emit("SHOULD_REFRESH_RENDER");
  }

  get path() {
    return [...this.listr.path, this.initialTitle];
  }

  async check(ctx) {
    if (this.state === "WAITING") {
      this.enabled = await assertFunctionOrSelf(this.task?.enabled ?? true, ctx);
      this.emit("ENABLED", this.enabled);
      this.listr.events.emit("SHOULD_REFRESH_RENDER");
    }
    return this.enabled;
  }

  hasSubtasks() {
    return this.subtasks?.length > 0;
  }

  hasFinalized() {
    return this.isCompleted() || this.hasFailed() || this.isSkipped() || this.hasRolledBack();
  }

  isPending() {
    return this.isStarted() || this.isPrompt() || this.hasReset();
  }

  isStarted() {
    return this.state === "STARTED";
  }

  isSkipped() {
    return this.state === "SKIPPED";
  }

  isCompleted() {
    return this.state === "COMPLETED";
  }

  hasFailed() {
    return this.state === "FAILED";
  }

  isRollingBack() {
    return this.state === "ROLLING_BACK";
  }

  hasRolledBack() {
    return this.state === "ROLLED_BACK";
  }

  isRetrying() {
    return this.state === "RETRY";
  }

  hasReset() {
    return this.state === "RETRY" || this.state === "ROLLING_BACK";
  }

  isEnabled() {
    return this.enabled;
  }

  hasTitle() {
    return typeof this?.title === "string";
  }

  isPrompt() {
    return this.state === "PROMPT" || this.state === "PROMPT_COMPLETED";
  }

  isPaused() {
    return this.state === "PAUSED";
  }

  isClosed() {
    return this.closed;
  }

  async pause(time) {
    const state = this.state;
    this.state$ = "PAUSED";
    this.message$ = {
      paused: Date.now() + time
    };
    await delay(time);
    this.state$ = state;
    this.message$ = {
      paused: null
    };
  }

  async run(context, wrapper) {
    const handleResult = async (result) => {
      if (result instanceof Listr) {
        result.options = { ...this.options, ...result.options };
        result.rendererClass = getRendererClass("silent");
        this.subtasks = result.tasks;
        result.errors = this.listr.errors;
        this.emit("SUBTASK", this.subtasks);
        result = result.run(context);
      } else if (result instanceof Promise) {
        result = result.then(handleResult);
      } else if (isReadable(result)) {
        result = new Promise((resolve, reject) => {
          result.on("data", (data) => {
            this.output$ = data.toString();
          });
          result.on("error", (error) => reject(error));
          result.on("end", () => resolve(null));
        });
      } else if (isObservable(result)) {
        result = new Promise((resolve, reject) => {
          result.subscribe({
            next: (data) => { this.output$ = data; },
            error: reject,
            complete: resolve
          });
        });
      }
      return result;
    };

    const startTime = Date.now();
    this.state$ = "STARTED";
    const skipped = await assertFunctionOrSelf(this.task?.skip ?? false, context);

    if (skipped) {
      if (typeof skipped === "string") {
        this.message$ = { skip: skipped };
      } else if (this.hasTitle()) {
        this.message$ = { skip: this.title };
      } else {
        this.message$ = { skip: "Skipped task without a title." };
      }
      this.state$ = "SKIPPED";
      return;
    }

    try {
      const retryCount = typeof this.task?.retry === "number" && this.task.retry > 0 ? this.task.retry + 1 : typeof this.task?.retry === "object" && this.task.retry.tries > 0 ? this.task.retry.tries + 1 : 1;
      const retryDelay = typeof this.task.retry === "object" && this.task.retry.delay;

      for (let retries = 1; retries <= retryCount; retries++) {
        try {
          await handleResult(this.taskFn(context, wrapper));
          break;
        } catch (err) {
          if (retries !== retryCount) {
            this.retry = { count: retries, error: err };
            this.message$ = { retry: this.retry };
            this.title$ = this.initialTitle;
            this.output = void 0;
            wrapper.report(err, "WILL_RETRY");
            this.state$ = "RETRY";
            if (retryDelay) {
              await this.pause(retryDelay);
            }
          } else {
            throw err;
          }
        }
      }

      if (this.isStarted() || this.isRetrying()) {
        this.message$ = { duration: Date.now() - startTime };
        this.state$ = "COMPLETED";
      }
    } catch (error) {
      if (this.prompt instanceof PromptError) {
        error = this.prompt;
      }
      if (this.task?.rollback) {
        wrapper.report(error, "WILL_ROLLBACK");
        try {
          this.state$ = "ROLLING_BACK";
          await this.task.rollback(context, wrapper);
          this.message$ = { rollback: this.title };
          this.state$ = "ROLLED_BACK";
        } catch (err) {
          this.state$ = "FAILED";
          wrapper.report(err, "HAS_FAILED_TO_ROLLBACK");
          this.close();
          throw err;
        }
        if (this.listr.options?.exitAfterRollback !== false) {
          this.close();
          throw error;
        }
      } else {
        this.state$ = "FAILED";
        if (this.listr.options.exitOnError !== false && await assertFunctionOrSelf(this.task?.exitOnError, context) !== false) {
          wrapper.report(error, "HAS_FAILED");
          this.close();
          throw error;
        } else if (!this.hasSubtasks()) {
          wrapper.report(error, "HAS_FAILED_WITHOUT_ERROR");
        }
      }
    } finally {
      this.close();
    }
  }

  close() {
    this.emit("CLOSED");
    this.listr.events.emit("SHOULD_REFRESH_RENDER");
    this.complete();
  }
}

// Main Listr Class
class Listr {
  constructor(task, options, parentTask) {
    this.task = task;
    this.options = options;
    this.parentTask = parentTask;
    this.options = {
      concurrent: false,
      renderer: "default",
      fallbackRenderer: "simple",
      exitOnError: true,
      exitAfterRollback: true,
      collectErrors: false,
      registerSignalListeners: true,
      ...this.parentTask?.options ?? {},
      ...options
    };

    if (this.options.concurrent === true) {
      this.options.concurrent = Infinity;
    } else if (typeof this.options.concurrent !== "number") {
      this.options.concurrent = 1;
    }

    this.concurrency = new Concurrency({ concurrency: this.options.concurrent });

    if (parentTask) {
      this.path = [...parentTask.listr.path, parentTask.title];
      this.errors = parentTask.listr.errors;
    }

    if (this.parentTask?.listr.events instanceof ListrEventManager) {
      this.events = this.parentTask.listr.events;
    } else {
      this.events = new ListrEventManager();
    }

    const renderer = getRenderer({
      renderer: this.options.renderer,
      rendererOptions: this.options.rendererOptions,
      fallbackRenderer: this.options.fallbackRenderer,
      fallbackRendererOptions: this.options.fallbackRendererOptions,
      fallbackRendererCondition: this.options?.fallbackRendererCondition,
      silentRendererCondition: this.options?.silentRendererCondition
    });

    this.rendererClass = renderer.renderer;
    this.rendererClassOptions = renderer.options;
    this.rendererSelection = renderer.selection;
    this.add(task ?? []);
    
    if (this.options.registerSignalListeners) {
      this.boundSignalHandler = this.signalHandler.bind(this);
      process.once("SIGINT", this.boundSignalHandler).setMaxListeners(0);
    }

    if (this.options?.forceTTY || process.env["LISTR_FORCE_TTY"]) {
      process.stdout.isTTY = true;
      process.stderr.isTTY = true;
    }

    if (this.options?.forceUnicode) {
      process.env["LISTR_FORCE_UNICODE"] = "1";
    }
  }

  tasks = [];
  errors = [];
  ctx;
  events;
  path = [];
  rendererClass;
  rendererClassOptions;
  rendererSelection;
  boundSignalHandler;
  concurrency;
  renderer;

  isRoot() {
    return !this.parentTask;
  }

  isSubtask() {
    return !!this.parentTask;
  }

  add(tasks) {
    this.tasks.push(...this.generate(tasks));
  }

  async run(context) {
    if (!this.renderer) {
      this.renderer = new this.rendererClass(this.tasks, this.rendererClassOptions, this.events);
    }
    await this.renderer.render();
    this.ctx = this.options?.ctx ?? context ?? {};
    await Promise.all(this.tasks.map((task) => task.check(this.ctx)));
    try {
      await Promise.all(this.tasks.map((task) => this.concurrency.add(() => this.runTask(task))));
      this.renderer.end();
      this.removeSignalHandler();
    } catch (err) {
      if (this.options.exitOnError !== false) {
        this.renderer.end(err);
        this.removeSignalHandler();
        throw err;
      }
    }
    return this.ctx;
  }

  generate(tasks) {
    tasks = Array.isArray(tasks) ? tasks : [tasks];
    return tasks.map((task) => {
      let rendererTaskOptions;
      if (this.rendererSelection === "PRIMARY") {
        rendererTaskOptions = task.rendererOptions;
      } else if (this.rendererSelection === "SECONDARY") {
        rendererTaskOptions = task.fallbackRendererOptions;
      }
      return new Task(
        this,
        task,
        this.options,
        this.rendererClassOptions,
        rendererTaskOptions
      );
    });
  }

  async runTask(task) {
    if (!await task.check(this.ctx)) {
      return;
    }
    return new TaskWrapper(task).run(this.ctx);
  }

  signalHandler() {
    this.tasks?.forEach(async (task) => {
      if (task.isPending()) {
        task.state$ = "FAILED";
      }
    });
    if (this.isRoot()) {
      this.renderer.end(new Error("Interrupted."));
      process.exit(127);
    }
  }

  removeSignalHandler() {
    if (this.boundSignalHandler) {
      process.removeListener("SIGINT", this.boundSignalHandler);
    }
  }
}
