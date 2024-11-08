'use strict';

const net = require('net');
const tls = require('tls');
const util = require('util');
const utils = require('./lib/utils');
const Command = require('./lib/command');
const Queue = require('denque');
const errorClasses = require('./lib/customErrors');
const EventEmitter = require('events');
const Parser = require('redis-parser');
const RedisErrors = require('redis-errors');
const commands = require('redis-commands');
const debug = require('./lib/debug');
const unifyOptions = require('./lib/createClient');

const SUBSCRIBE_COMMANDS = {
    subscribe: true,
    unsubscribe: true,
    psubscribe: true,
    punsubscribe: true
};

function noop () {}

function handleDetectBuffersReply (reply, command, bufferArgs) {
    if (bufferArgs === false || this.messageBuffers) {
        reply = utils.replyToStrings(reply);
    }
    if (command === 'hgetall') {
        reply = utils.replyToObject(reply);
    }
    return reply;
}

exports.debugMode = /\bredis\b/i.test(process.env.NODE_DEBUG);

class RedisClient extends EventEmitter {
    constructor(options = {}, stream) {
        super();
        options = utils.clone(options);
        this._setupConnection(options, stream);
        this._initializeOptions(options);
        this._createStream();
        this.on('newListener', this._handleNewListener.bind(this));
    }

    static connectionId = 0;

    _setupConnection(options, stream) {
        const cnxOptions = {};
        for (const tlsOption in options.tls) {
            cnxOptions[tlsOption] = options.tls[tlsOption];
            if (['port', 'host', 'path', 'family'].includes(tlsOption)) {
                options[tlsOption] = options.tls[tlsOption];
            }
        }

        if (stream) {
            options.stream = stream;
            this.address = '"Private stream"';
        } else if (options.path) {
            cnxOptions.path = options.path;
            this.address = options.path;
        } else {
            cnxOptions.port = +options.port || 6379;
            cnxOptions.host = options.host || '127.0.0.1';
            cnxOptions.family = (!options.family && net.isIP(cnxOptions.host)) || (options.family === 'IPv6' ? 6 : 4);
            this.address = `${cnxOptions.host}:${cnxOptions.port}`;
        }

        this.connectionOptions = cnxOptions;
        this.connectionId = RedisClient.connectionId++;
        this.connected = false;
        this.ready = false;
    }

    _initializeOptions(options) {
        if (options.socketKeepAlive === undefined) {
            options.socketKeepAlive = true;
        }
        if (options.socketInitialDelay === undefined) {
            options.socketInitialDelay = 0;
        }
        
        for (const command in options.renameCommands) {
            options.renameCommands[command.toLowerCase()] = options.renameCommands[command];
        }
        
        options.returnBuffers = !!options.returnBuffers;
        options.detectBuffers = !!options.detectBuffers;
        
        if (options.returnBuffers && options.detectBuffers) {
            this._warn('WARNING: returning_buffers and detect_buffers both active. Return value always buffer.');
            options.detectBuffers = false;
        }
        if (options.detectBuffers) {
            this.handleReply = handleDetectBuffersReply;
        }

        this.shouldBuffer = false;
        this.commandQueue = new Queue();
        this.offlineQueue = new Queue();
        this.pipelineQueue = new Queue();
        this.connectTimeout = +options.connectTimeout || 3600000;
        this.enableOfflineQueue = options.enableOfflineQueue !== false;
        this.initializeRetryVars();
        this.pubSubMode = 0;
        this.subscriptionSet = {};
        this.monitoring = false;
        this.messageBuffers = false;
        this.closing = false;
        this.serverInfo = {};
        this.authPass = options.authPass || options.password;
        this.selectedDb = options.db;
        this.fireStrings = true;
        this.pipeline = false;
        this.subCommandsLeft = 0;
        this.timesConnected = 0;
        this.buffers = options.returnBuffers || options.detectBuffers;
        this.options = options;
        this.reply = 'ON';
    }

    _createStream() {
        this.replyParser = this._createParser();

        const streamExists = this.options.stream;
        const reconnecting = !streamExists && !!this.stream;
        
        if (reconnecting) {
            this.stream.removeAllListeners();
            this.stream.destroy();
        }
        
        if (streamExists && !this.stream) {
            this.stream = this.options.stream;
        } else if (!streamExists) {
            this.stream = this.options.tls ? tls.connect(this.connectionOptions) : net.createConnection(this.connectionOptions);
        }

        if (this.options.connectTimeout) {
            this.stream.setTimeout(this.connectTimeout, () => {
                this.retryTotalTime = this.connectTimeout;
                this.connectionGone('timeout');
            });
        }

        const connectEvent = this.options.tls ? 'secureConnect' : 'connect';
        this.stream.once(connectEvent, () => {
            this.stream.removeAllListeners('timeout');
            this.timesConnected++;
            this.onConnect();
        });

        this.stream.on('data', (buffer) => {
            debug(`Net read ${this.address} id ${this.connectionId}`);
            this.replyParser.execute(buffer);
        });

        this.stream.on('error', (err) => {
            this.onError(err);
        });

        this.stream.once('close', (hadError) => {
            this.connectionGone('close');
        });

        this.stream.once('end', () => {
            this.connectionGone('end');
        });

        this.stream.on('drain', () => {
            this.drain();
        });

        this.stream.setNoDelay();

        if (this.authPass !== undefined) {
            this.ready = true;
            this.auth(this.authPass, (err) => {
                if (err && err.code !== 'UNCERTAIN_STATE') {
                    this.emit('error', err);
                }
            });
            this.ready = false;
        }
    }

    _createParser() {
        return new Parser({
            returnReply: (data) => this.returnReply(data),
            returnError: (err) => this.returnError(err),
            returnFatalError: (err) => {
                err.message += '. Please report this.';
                this.ready = false;
                this.flushAndError({
                    message: 'Fatal error encountered. Command aborted.',
                    code: 'NR_FATAL'
                }, {
                    error: err,
                    queues: ['commandQueue']
                });
                this.emit('error', err);
                this.createStream();
            },
            returnBuffers: this.buffers || this.messageBuffers,
            stringNumbers: this.options.stringNumbers || false
        });
    }

    _handleNewListener(event) {
        if ((['message_buffer', 'pmessage_buffer', 'messageBuffer', 'pmessageBuffer'].includes(event)) && !this.buffers && !this.messageBuffers) {
            this.replyParser.optionReturnBuffers = true;
            this.messageBuffers = true;
            this.handleReply = handleDetectBuffersReply;
        }
    }

    handleReply(reply, command) {
        if (command === 'hgetall') {
            reply = utils.replyToObject(reply);
        }
        return reply;
    }

    cork = noop;
    uncork = noop;

    initializeRetryVars() {
        this.retryTimer = null;
        this.retryTotalTime = 0;
        this.retryDelay = 200;
        this.retryBackoff = 1.7;
        this.attempts = 1;
    }

    _warn(msg) {
        process.nextTick(() => {
            if (this.listeners('warning').length !== 0) {
                this.emit('warning', msg);
            } else {
                console.warn('node_redis:', msg);
            }
        });
    }

    flushAndError(errorAttributes, options = {}) {
        const aggregatedErrors = [];
        const queueNames = options.queues || ['commandQueue', 'offlineQueue'];
        
        for (const queueName of queueNames) {
            if (queueName === 'commandQueue') {
                errorAttributes.message += ' It might have been processed.';
            } else {
                errorAttributes.message = errorAttributes.message.replace(' It might have been processed.', '');
            }

            for (let commandObj = this[queueName].shift(); commandObj; commandObj = this[queueName].shift()) {
                const err = new errorClasses.AbortError(errorAttributes);
                if (commandObj.error) {
                    err.stack = err.stack + commandObj.error.stack.replace(/^Error.*?\n/, '\n');
                }
                err.command = commandObj.command.toUpperCase();
                if (commandObj.args && commandObj.args.length) {
                    err.args = commandObj.args;
                }
                if (options.error) {
                    err.origin = options.error;
                }
                if (typeof commandObj.callback === 'function') {
                    commandObj.callback(err);
                } else {
                    aggregatedErrors.push(err);
                }
            }
        }

        if (exports.debugMode && aggregatedErrors.length) {
            let error;
            if (aggregatedErrors.length === 1) {
                error = aggregatedErrors[0];
            } else {
                errorAttributes.message = errorAttributes.message.replace('It', 'They').replace(/command/i, '$&s');
                error = new errorClasses.AggregateError(errorAttributes);
                error.errors = aggregatedErrors;
            }
            this.emit('error', error);
        }
    }

    onError(err) {
        if (this.closing) {
            return;
        }

        err.message = `Redis connection to ${this.address} failed - ${err.message}`;
        debug(err.message);
        this.connected = false;
        this.ready = false;

        if (!this.options.retryStrategy) {
            this.emit('error', err);
        }
        this.connectionGone('error', err);
    }

    onConnect() {
        debug(`Stream connected ${this.address} id ${this.connectionId}`);

        this.connected = true;
        this.ready = false;
        this.emittedEnd = false;
        this.stream.setKeepAlive(this.options.socketKeepAlive, this.options.socketInitialDelay);
        this.stream.setTimeout(0);

        this.emit('connect');
        this.initializeRetryVars();

        if (this.options.noReadyCheck) {
            this.onReady();
        } else {
            this.readyCheck();
        }
    }

    onReady() {
        debug(`on_ready called ${this.address} id ${this.connectionId}`);
        this.ready = true;

        this.cork = () => {
            this.pipeline = true;
            if (this.stream.cork) {
                this.stream.cork();
            }
        };

        this.uncork = () => {
            if (this.fireStrings) {
                this.writeStrings();
            } else {
                this.writeBuffers();
            }
            this.pipeline = false;
            this.fireStrings = true;
            if (this.stream.uncork) {
                this.stream.uncork();
            }
        };

        if (this.selectedDb !== undefined) {
            this.internalSendCommand(new Command('select', [this.selectedDb]));
        }
        if (this.monitoring) {
            this.internalSendCommand(new Command('monitor', []));
        }

        const callbackCount = Object.keys(this.subscriptionSet).length;
        if (!this.options.disableResubscribing && callbackCount) {
            const callback = () => {
                callbackCount--;
                if (callbackCount === 0) {
                    this.emit('ready');
                }
            };

            debug('Sending pub/sub on_ready commands');
            for (const key in this.subscriptionSet) {
                const command = key.slice(0, key.indexOf('_'));
                const args = this.subscriptionSet[key];
                this[command]([args], callback);
            }
            this.sendOfflineQueue();
            return;
        }
        this.sendOfflineQueue();
        this.emit('ready');
    }

    onInfoCmd(err, res) {
        if (err) {
            if (err.message === "ERR unknown command 'info'") {
                this.onReady();
                return;
            }
            err.message = `Ready check failed: ${err.message}`;
            this.emit('error', err);
            return;
        }

        if (!res) {
            debug('The info command returned without any data.');
            this.onReady();
            return;
        }

        if (!this.serverInfo.loading || this.serverInfo.loading === '0') {
            if (this.serverInfo.master_link_status && this.serverInfo.master_link_status !== 'up') {
                this.serverInfo.loading_eta_seconds = 0.05;
            } else {
                debug('Redis server ready.');
                this.onReady();
                return;
            }
        }

        let retryTime = +this.serverInfo.loading_eta_seconds * 1000;
        retryTime = Math.min(retryTime, 1000);
        debug(`Redis server still loading, trying again in ${retryTime}`);
        setTimeout(() => {
            this.readyCheck();
        }, retryTime);
    }

    readyCheck() {
        debug('Checking server ready state...');
        this.ready = true;
        this.info((err, res) => {
            this.onInfoCmd(err, res);
        });
        this.ready = false;
    }

    sendOfflineQueue() {
        for (let commandObj = this.offlineQueue.shift(); commandObj; commandObj = this.offlineQueue.shift()) {
            debug(`Sending offline command: ${commandObj.command}`);
            this.internalSendCommand(commandObj);
        }
        this.drain();
    }

    connectionGone(why, error = null) {
        if (this.retryTimer) {
            return;
        }

        debug(`Redis connection is gone from ${why} event.`);
        this.connected = false;
        this.ready = false;
        this.cork = noop;
        this.uncork = noop;
        this.pipeline = false;
        this.pubSubMode = 0;

        if (!this.emittedEnd) {
            this.emit('end');
            this.emittedEnd = true;
        }

        if (this.closing) {
            debug('Connection ended by quit / end command, not retrying.');
            this.flushAndError({
                message: 'Stream connection ended and command aborted.',
                code: 'NR_CLOSED'
            }, {
                error
            });
            return;
        }

        if (typeof this.options.retryStrategy === 'function') {
            const retryParams = {
                attempt: this.attempts,
                error
            };
            
            if (this.options.camelCase) {
                retryParams.totalRetryTime = this.retryTotalTime;
                retryParams.timesConnected = this.timesConnected;
            } else {
                retryParams.total_retry_time = this.retryTotalTime;
                retryParams.times_connected = this.timesConnected;
            }

            this.retryDelay = this.options.retryStrategy(retryParams);
            if (typeof this.retryDelay !== 'number') {
                if (this.retryDelay instanceof Error) {
                    error = this.retryDelay;
                }

                const errorMessage = 'Redis connection in broken state: retry aborted.';
                this.flushAndError({
                    message: errorMessage,
                    code: 'CONNECTION_BROKEN',
                }, {
                    error
                });

                const retryError = new Error(errorMessage);
                retryError.code = 'CONNECTION_BROKEN';
                if (error) {
                    retryError.origin = error;
                }
                this.end(false);
                this.emit('error', retryError);
                return;
            }
        }

        if (this.retryTotalTime >= this.connectTimeout) {
            const message = 'Redis connection in broken state: connection timeout exceeded.';
            this.flushAndError({
                message: message,
                code: 'CONNECTION_BROKEN',
            }, {
                error
            });

            const err = new Error(message);
            err.code = 'CONNECTION_BROKEN';
            if (error) {
                err.origin = error;
            }
            this.end(false);
            this.emit('error', err);
            return;
        }

        if (this.options.retryUnfulfilledCommands) {
            this.offlineQueue.unshift(...this.commandQueue.toArray());
            this.commandQueue.clear();
        } else if (this.commandQueue.length !== 0) {
            this.flushAndError({
                message: 'Redis connection lost and command aborted.',
                code: 'UNCERTAIN_STATE'
            }, {
                error,
                queues: ['commandQueue']
            });
        }

        if (this.retryTotalTime + this.retryDelay > this.connectTimeout) {
            this.retryDelay = this.connectTimeout - this.retryTotalTime;
        }

        debug(`Retry connection in ${this.retryDelay} ms`);
        this.retryTimer = setTimeout(this._retryConnection.bind(this), this.retryDelay, this, error);
    }

    _retryConnection(self, error) {
        debug('Retrying connection...');

        const reconnectParams = {
            delay: self.retryDelay,
            attempt: self.attempts,
            error
        };
        
        if (self.options.camelCase) {
            reconnectParams.totalRetryTime = self.retryTotalTime;
            reconnectParams.timesConnected = self.timesConnected;
        } else {
            reconnectParams.total_retry_time = self.retryTotalTime;
            reconnectParams.times_connected = self.timesConnected;
        }

        self.emit('reconnecting', reconnectParams);

        self.retryTotalTime += self.retryDelay;
        self.attempts += 1;
        self.retryDelay = Math.round(self.retryDelay * self.retryBackoff);
        self.createStream();
        self.retryTimer = null;
    }

    internalSendCommand(commandObj) {
        let args = commandObj.args;
        const command = commandObj.command;
        const len = args.length;
        const argsCopy = new Array(len);
        let bigData = false;

        if (process.domain && commandObj.callback) {
            commandObj.callback = process.domain.bind(commandObj.callback);
        }

        if (!this.ready || !this.stream.writable) {
            handleOfflineCommand(this, commandObj);
            return false;
        }

        for (let i = 0; i < len; i++) {
            if (typeof args[i] === 'string') {
                if (args[i].length > 30000) {
                    bigData = true;
                    argsCopy[i] = Buffer.from(args[i], 'utf8');
                } else {
                    argsCopy[i] = args[i];
                }
            } else if (typeof args[i] === 'object') {
                if (args[i] instanceof Date) {
                    argsCopy[i] = args[i].toString();
                } else if (Buffer.isBuffer(args[i])) {
                    argsCopy[i] = args[i];
                    commandObj.bufferArgs = true;
                    bigData = true;
                } else {
                    const invalidArgError = new Error(
                        `node_redis: The ${command.toUpperCase()} command contains a invalid argument type.\n` +
                        `Only strings, dates and buffers are accepted. Please update your code to use valid argument types.`
                    );
                    invalidArgError.command = commandObj.command.toUpperCase();
                    if (commandObj.args && commandObj.args.length) {
                        invalidArgError.args = commandObj.args;
                    }
                    if (commandObj.callback) {
                        commandObj.callback(invalidArgError);
                        return false;
                    }
                    throw invalidArgError;
                }
            } else if (typeof args[i] === 'undefined') {
                const undefinedArgError = new Error(
                    `node_redis: The ${command.toUpperCase()} command contains a invalid argument type of "undefined".\n` +
                    `Only strings, dates and buffers are accepted. Please update your code to use valid argument types.`
                );
                undefinedArgError.command = commandObj.command.toUpperCase();
                if (commandObj.args && commandObj.args.length) {
                    undefinedArgError.args = commandObj.args;
                }
                commandObj.callback(undefinedArgError);
                return false;
            } else {
                argsCopy[i] = '' + args[i];
            }
        }

        if (this.options.prefix) {
            const prefixKeys = commands.getKeyIndexes(command, argsCopy);
            while (prefixKeys.length) {
                const i = prefixKeys.pop();
                argsCopy[i] = this.options.prefix + argsCopy[i];
            }
        }
        if (this.options.renameCommands && this.options.renameCommands[command]) {
            command = this.options.renameCommands[command];
        }
        
        let commandStr = `*${len + 1}\r\n$${command.length}\r\n${command}\r\n`;

        if (!bigData) {
            for (let i = 0; i < len; i++) {
                const arg = argsCopy[i];
                commandStr += `$${Buffer.byteLength(arg)}\r\n${arg}\r\n`;
            }
            debug(`Send ${this.address} id ${this.connectionId}: ${commandStr}`);
            this.write(commandStr);
        } else {
            debug(`Send command (${commandStr}) has Buffer arguments`);
            this.fireStrings = false;
            this.write(commandStr);

            for (let i = 0; i < len; i++) {
                const arg = argsCopy[i];
                if (typeof arg === 'string') {
                    this.write(`$${Buffer.byteLength(arg)}\r\n${arg}\r\n`);
                } else {
                    this.write(`$${arg.length}\r\n`);
                    this.write(arg);
                    this.write('\r\n');
                }
                debug(`send_command: buffer send ${arg.length} bytes`);
            }
        }

        if (commandObj.callOnWrite) {
            commandObj.callOnWrite();
        }

        if (this.reply === 'ON') {
            this.commandQueue.push(commandObj);
        } else {
            if (commandObj.callback) {
                utils.replyInOrder(this, commandObj.callback, null, undefined, this.commandQueue);
            }
            this.reply = this.reply === 'SKIP' ? 'SKIP_ONE_MORE' : 'ON';
        }

        return !this.shouldBuffer;
    }

    writeStrings() {
        let str = '';
        for (let command = this.pipelineQueue.shift(); command; command = this.pipelineQueue.shift()) {
            if (str.length + command.length > 4 * 1024 * 1024) {
                this.shouldBuffer = !this.stream.write(str);
                str = '';
            }
            str += command;
        }
        if (str !== '') {
            this.shouldBuffer = !this.stream.write(str);
        }
    }

    writeBuffers() {
        for (let command = this.pipelineQueue.shift(); command; command = this.pipelineQueue.shift()) {
            this.shouldBuffer = !this.stream.write(command);
        }
    }

    write(data) {
        if (!this.pipeline) {
            this.shouldBuffer = !this.stream.write(data);
            return;
        }
        this.pipelineQueue.push(data);
    }
}

// Expose client creation and classes
exports.createClient = function () {
    return new RedisClient(unifyOptions.apply(null, arguments));
};

exports.RedisClient = RedisClient;
exports.print = utils.print;
exports.Multi = require('./lib/multi');
exports.AbortError = errorClasses.AbortError;
exports.RedisError = RedisErrors.RedisError;
exports.ParserError = RedisErrors.ParserError;
exports.ReplyError = RedisErrors.ReplyError;
exports.AggregateError = errorClasses.AggregateError;

// Load and expose additional Redis commands
require('./lib/individualCommands');
require('./lib/extendedApi');

// Enable adding new commands
exports.addCommand = exports.add_command = require('./lib/commands');
