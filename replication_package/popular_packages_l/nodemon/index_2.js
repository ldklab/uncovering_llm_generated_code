#!/usr/bin/env node

const { spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');

class ScriptReloader {
  constructor(script, options = {}) {
    this.scriptPath = script;
    this.options = options;
    this.restartDelay = options.delay || 1000; // Default delay is 1000ms
    this.extensionsToWatch = options.extensions ? options.extensions.split(',') : ['js','mjs','json'];
    this.pathsToIgnore = options.ignore ? options.ignore.split(',') : []; // Convert ignore paths to array
    this.currentProcess = null;
    this.initiateScript();
    this.setupFileWatcher();
  }
  
  initiateScript() {
    console.log(`[nodemon] initializing script \`${this.scriptPath}\``);
    this.launchScript();
  }

  setupFileWatcher() {
    const watcher = chokidar.watch(this.options.watchDirs || '.', { ignored: this.pathsToIgnore });
    watcher.on('change', (modifiedFile) => {
      if (this.needsRestart(modifiedFile)) {
        this.queueRestart();
      }
    });
  }

  needsRestart(modifiedFile) {
    const fileExtension = path.extname(modifiedFile).slice(1);
    return this.extensionsToWatch.includes(fileExtension);
  }

  queueRestart() {
    if (this.restartTimeout) return;
    this.restartTimeout = setTimeout(() => {
      this.restartTimeout = null;
      this.launchScript();
    }, this.restartDelay);
  }

  launchScript() {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGUSR2');
      console.log('[nodemon] restarting script due to changes...');
    }

    this.currentProcess = spawn('node', [this.scriptPath], { stdio: 'inherit' });

    this.currentProcess.on('exit', (code, signal) => {
      if (signal !== 'SIGUSR2') process.exit(code);
    });
  }
}

function getOptionsFromArgs() {
  const rawArgs = process.argv.slice(2);
  let watchDirs, extensions, ignore, delay;
  let scriptToRun = rawArgs[0];

  rawArgs.forEach((arg, index) => {
    switch (arg) {
      case '--watch':
        watchDirs = rawArgs[index + 1];
        break;
      case '--ext':
        extensions = rawArgs[index + 1];
        break;
      case '--ignore':
        ignore = rawArgs[index + 1];
        break;
      case '--delay':
        delay = parseFloat(rawArgs[index + 1]) * 1000;
        break;
    }
  });

  if (!scriptToRun) {
    console.error('[nodemon] No script specified.');
    process.exit(1);
  }

  return { script: scriptToRun, watchDirs, extensions, ignore, delay };
}

function runNodemonClone() {
  const config = getOptionsFromArgs();
  new ScriptReloader(config.script, {
    watchDirs: config.watchDirs,
    extensions: config.extensions,
    ignore: config.ignore,
    delay: config.delay
  });
}

runNodemonClone();
