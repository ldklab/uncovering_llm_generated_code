#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

class Nodemon {
  constructor(script, options = {}) {
    this.script = script;
    this.options = options;
    this.restartDelay = this.options.delay || 1000;
    this.watchExtensions = this.options.ext || 'js,mjs,json';
    this.ignorePaths = this.options.ignore || [];
    this.process = null;
    this.initialStart();
    this.startWatching();
  }

  initialStart() {
    console.log('[nodemon] starting `' + this.script + '`');
    this.runNodeScript();
  }

  startWatching() {
    const watcher = chokidar.watch(this.options.watch || '.', { ignored: this.ignorePaths });
    watcher.on('change', (filePath) => {
      if (this.shouldRestart(filePath)) {
        this.scheduleRestart();
      }
    });
  }

  shouldRestart(filePath) {
    const ext = path.extname(filePath).slice(1);
    return this.watchExtensions.split(',').includes(ext);
  }

  scheduleRestart() {
    if (this.restartTimeout) return;
    this.restartTimeout = setTimeout(() => {
      this.restartTimeout = null;
      this.runNodeScript();
    }, this.restartDelay);
  }

  runNodeScript() {
    if (this.process) {
      this.process.kill('SIGUSR2');
      console.log('[nodemon] restarting due to changes...');
    }
  
    this.process = spawn('node', [this.script], {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    });

    this.process.on('exit', (code, signal) => {
      if (signal !== 'SIGUSR2') {
        process.exit(code);
      }
    });
  }
}

function parseArguments() {
  const args = process.argv.slice(2);
  let watch, ext, ignore, delay;
  let script = args[0];
  
  args.forEach((arg, idx) => {
    switch (arg) {
      case '--watch':
        watch = args[idx + 1];
        break;
      case '--ext':
        ext = args[idx + 1];
        break;
      case '--ignore':
        ignore = args[idx + 1];
        break;
      case '--delay':
        delay = parseFloat(args[idx + 1]) * 1000;
        break;
    }
  });

  if (!script) {
    console.error('[nodemon] No script provided.');
    process.exit(1);
  }

  return { script, watch, ext, ignore, delay };
}

function main() {
  const config = parseArguments();
  new Nodemon(config.script, {
    watch: config.watch,
    ext: config.ext,
    ignore: config.ignore,
    delay: config.delay,
  });
}

main();
