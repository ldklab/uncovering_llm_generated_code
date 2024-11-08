#!/usr/bin/env node

const { spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');

class Nodemon {
  constructor(script, options = {}) {
    this.script = script;
    this.restartDelay = options.delay || 1000;
    this.watchExtensions = options.ext || 'js,mjs,json';
    this.ignorePaths = options.ignore || [];
    this.process = null;
    this.initialize();
  }

  initialize() {
    this.startScript();
    this.setupWatcher();
  }

  startScript() {
    if (this.process) {
      this.process.kill('SIGUSR2');
      console.log('[nodemon] restarting due to changes...');
    } else {
      console.log('[nodemon] starting `' + this.script + '`');
    }

    this.process = spawn('node', [this.script], { stdio: 'inherit' });
    this.process.on('exit', (code, signal) => {
      if (signal !== 'SIGUSR2') process.exit(code);
    });
  }

  setupWatcher() {
    const watcher = chokidar.watch(this.options.watch || '.', { ignored: this.ignorePaths });
    watcher.on('change', filePath => {
      if (this.shouldRestart(filePath)) {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = setTimeout(() => this.startScript(), this.restartDelay);
      }
    });
  }

  shouldRestart(filePath) {
    return this.watchExtensions.split(',').includes(path.extname(filePath).slice(1));
  }
}

function parseArguments() {
  const [, , ...args] = process.argv;
  if (!args.length) {
    console.error('[nodemon] No script provided.');
    process.exit(1);
  }

  let [script, ...rest] = args;
  const options = rest.reduce((acc, val, idx, arr) => {
    if (val.startsWith('--')) acc[val.slice(2)] = arr[idx + 1] || true;
    return acc;
  }, {});

  if (options.delay) options.delay *= 1000;
  return { script, ...options };
}

function main() {
  const { script, watch, ext, ignore, delay } = parseArguments();
  new Nodemon(script, { watch, ext, ignore, delay });
}

main();
