#!/usr/bin/env node

const { spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');

class Nodemon {
  constructor(script, options) {
    this.script = script;
    this.watchExtensions = (options.ext || 'js,mjs,json').split(',');
    this.ignorePaths = options.ignore || [];
    this.restartDelay = options.delay || 1000;
    this.process = null;

    this.initialStart();
    this.startWatcher(options.watch || '.');
  }

  initialStart() {
    this.startScript();
    console.log(`[nodemon] starting \`${this.script}\``);
  }

  startScript() {
    if (this.process) {
      this.process.kill('SIGUSR2');
      console.log('[nodemon] restarting due to changes...');
    }
    this.process = spawn('node', [this.script], { stdio: 'inherit' });
    this.process.on('exit', (code, signal) => {
      if (signal !== 'SIGUSR2') process.exit(code);
    });
  }

  startWatcher(watchPath) {
    const watcher = chokidar.watch(watchPath, { ignored: this.ignorePaths });
    watcher.on('change', (filePath) => this.handleFileChange(filePath));
  }

  handleFileChange(filePath) {
    if (this.fileNeedsRestart(filePath)) this.scheduleRestart();
  }

  fileNeedsRestart(filePath) {
    const ext = path.extname(filePath).slice(1);
    return this.watchExtensions.includes(ext);
  }

  scheduleRestart() {
    if (this.restartTimeout) return;
    this.restartTimeout = setTimeout(() => {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
      this.startScript();
    }, this.restartDelay);
  }
}

function parseArguments() {
  const args = process.argv.slice(2);
  const options = {};
  options.script = args[0];

  args.forEach((arg, index) => {
    switch (arg) {
      case '--watch':
        options.watch = args[index + 1];
        break;
      case '--ext':
        options.ext = args[index + 1];
        break;
      case '--ignore':
        options.ignore = args[index + 1];
        break;
      case '--delay':
        options.delay = parseFloat(args[index + 1]) * 1000;
        break;
    }
  });

  if (!options.script) {
    console.error('[nodemon] No script provided.');
    process.exit(1);
  }

  return options;
}

function main() {
  const options = parseArguments();
  new Nodemon(options.script, options);
}

main();
