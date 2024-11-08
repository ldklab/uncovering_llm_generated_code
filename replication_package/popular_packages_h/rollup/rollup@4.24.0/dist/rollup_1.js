'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const rollup = require('./shared/rollup.js');
const parseAst = require('./shared/parseAst.js');
const fseventsImporter = require('./shared/fsevents-importer.js');
const path = require('path');
require('node:process');
require('tty');
require('./native.js');
require('node:perf_hooks');
require('node:fs/promises');

class WatchEmitter {
    constructor() {
        this.currentHandlers = {};
        this.persistentHandlers = {};
    }

    async close() {}

    emit(event, ...args) {
        return Promise.all([
            ...this.getCurrentHandlers(event),
            ...this.getPersistentHandlers(event)
        ].map(handler => handler(...args)));
    }

    off(event, listener) {
        const listeners = this.persistentHandlers[event];
        if (listeners) {
            listeners.splice(listeners.indexOf(listener) >>> 0, 1);
        }
        return this;
    }

    on(event, listener) {
        this.getPersistentHandlers(event).push(listener);
        return this;
    }

    onCurrentRun(event, listener) {
        this.getCurrentHandlers(event).push(listener);
        return this;
    }

    once(event, listener) {
        const onceListener = (...args) => {
            this.off(event, onceListener);
            return listener(...args);
        };
        this.on(event, onceListener);
        return this;
    }

    removeAllListeners() {
        this.removeListenersForCurrentRun();
        this.persistentHandlers = {};
        return this;
    }

    removeListenersForCurrentRun() {
        this.currentHandlers = {};
        return this;
    }

    getCurrentHandlers(event) {
        return this.currentHandlers[event] || (this.currentHandlers[event] = []);
    }

    getPersistentHandlers(event) {
        return this.persistentHandlers[event] || (this.persistentHandlers[event] = []);
    }
}

function watch(configs) {
    const emitter = new WatchEmitter();
    watchInternal(configs, emitter).catch(rollup.handleError);
    return emitter;
}

async function watchInternal(configs, emitter) {
    const optionsList = await Promise.all(
        rollup.ensureArray(configs).map(config => rollup.mergeOptions(config, true))
    );
    const watchOptions = optionsList.filter(config => config.watch !== false);
    if (watchOptions.length === 0) {
        return parseAst.error(parseAst.logInvalidOption('watch', parseAst.URL_WATCH, 'at least one config must have "watch" not set to "false"'));
    }
    await fseventsImporter.loadFsEvents();
    const { Watcher } = await import('./shared/watch.js');
    new Watcher(watchOptions, emitter);
}

exports.VERSION = rollup.version;
exports.defineConfig = rollup.defineConfig;
exports.rollup = rollup.rollup;
exports.watch = watch;
