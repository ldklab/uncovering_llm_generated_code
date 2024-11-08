'use strict';

const net = require('net');
const tls = require('tls');
const util = require('util');
const EventEmitter = require('events');
const Parser = require('redis-parser');
const Queue = require('denque');
const { RedisError, ParserError } = require('redis-errors');
const { unifyOptions, handleReplyTypes, createCommandQueue } = require('./lib/helpers');
const debug = require('./lib/debug');
const errorClasses = require('./lib/customErrors');

function noop() {}

class RedisClient extends EventEmitter {
    constructor(options = {}, stream = null) {
        super();
        const { clone, replyToStrings, replyToObject } = require('./lib/utils');
        this.options = clone(options);
        this.connection_options = this.setupConnectionOptions(options, stream);
        this.connection_id = RedisClient.connectionId++;
        this.connected = false;
        this.ready = false;
        this.initializeRetryVars();
        this.stream = null;
        this.auth_pass = options.auth_pass || options.password;
        this.selected_db = options.db;
        this.command_queue = createCommandQueue();
        this.offline_queue = createCommandQueue();
        this.pipeline_queue = createCommandQueue();
        this.should_buffer = false;
        this.pub_sub_mode = 0;
        this.subscription_set = {};
        this.monitoring = false;
        this.pipeline = false;

        this.createStream();

        this.on('newListener', (event) => {
            if (!this.buffers && ['message_buffer', 'pmessage_buffer'].includes(event)) {
                this.replyParser.optionReturnBuffers = true;
                this.handleReply = handleReplyTypes(replyToStrings, replyToObject);
            }
        });
    }

    setupConnectionOptions(options, stream) {
        // Setup connection options for TCP or TLS connections
        let cnx_options = {};
        for (let tls_option in options.tls) {
            cnx_options[tls_option] = options.tls[tls_option];
            if (['port', 'host', 'path', 'family'].includes(tls_option)) {
                options[tls_option] = options.tls[tls_option];
            }
        }
        if (stream) {
            options.stream = stream;
            this.address = '"Private stream"';
        } else if (options.path) {
            cnx_options.path = options.path;
            this.address = options.path;
        } else {
            cnx_options.port = +options.port || 6379;
            cnx_options.host = options.host || '127.0.0.1';
            cnx_options.family = net.isIP(cnx_options.host) || (options.family === 'IPv6' ? 6 : 4);
            this.address = `${cnx_options.host}:${cnx_options.port}`;
        }
        return cnx_options;
    }

    createStream() {
        if (this.stream) {
            this.stream.removeAllListeners();
            this.stream.destroy();
        }
        this.stream = this.options.tls ? tls.connect(this.connection_options) : net.createConnection(this.connection_options);
        this.stream.setNoDelay();
        this.stream.once(this.options.tls ? 'secureConnect' : 'connect', this.onConnect.bind(this));
        this.stream.on('data', (buffer) => this.replyParser.execute(buffer));
        this.stream.on('error', this.onError.bind(this));
        this.stream.once('close', () => this.connectionGone('close'));
        this.stream.once('end', () => this.connectionGone('end'));
        this.stream.on('drain', this.drain.bind(this));
    }

    onConnect() {
        this.connected = true;
        this.ready = false;
        this.emit('connect');
        if (this.options.no_ready_check) {
            this.onReady();
        } else {
            this.readyCheck();
        }
    }

    onReady() {
        this.ready = true;
        // Restore subscription and monitoring after reconnect
        this.sendOfflineQueue();
        this.emit('ready');
    }

    onError(err) {
        if (this.closing) return;
        err.message = `Redis connection to ${this.address} failed - ${err.message}`;
        this.connected = false;
        this.ready = false;
        if (!this.options.retry_strategy) this.emit('error', err);
        this.connectionGone('error', err);
    }

    initializeRetryVars() {
        this.retry_timer = null;
        this.retry_totaltime = 0;
        this.retry_delay = 200;
        this.retry_backoff = 1.7;
        this.attempts = 1;
    }

    connectionGone(reason, error = null) {
        // Handle connection retry logic
        if (this.retry_timer) return;
        this.connected = false;
        this.ready = false;

        if (this.closing || typeof this.options.retry_strategy !== 'function') {
            this.end(false);
            return;
        }

        // Retry logic
        this.retry_delay = this.options.retry_strategy({ attempt: this.attempts, error });
        if (typeof this.retry_delay !== 'number') {
            this.flushCommandQueue(error, { message: 'Connection broken', code: 'CONNECTION_BROKEN' });
            this.end(false);
            return;
        }

        // Schedule retry
        this.retry_timer = setTimeout(this.createStream.bind(this), this.retry_delay);
    }

    flushCommandQueue(error, error_attributes = {}) {
        // Flush command and offline queues, invoking callbacks with errors
        const queues = ['command_queue', 'offline_queue'];
        queues.forEach((queue) => {
            while (this[queue].length) {
                const command = this[queue].shift();
                const err = new errorClasses.AbortError({ ...error_attributes, command: command.command.toUpperCase(), args: command.args });
                command.callback && command.callback(err);
            }
        });
    }

    sendOfflineQueue() {
        // Send commands from offline queue once connection is established
        while (this.offline_queue.length) {
            const command = this.offline_queue.shift();
            this.sendCommand(command);
        }
        this.drain();
    }

    sendCommand(command) {
        // Execute a Redis command
        if (!this.connected || !this.ready) {
            this.offline_queue.push(command);
            this.should_buffer = true;
            return false;
        }
        // Serialize command and send to Redis server
        const commandStr = this.serializeCommand(command);
        this.writeData(commandStr);
        this.command_queue.push(command);
        return !this.should_buffer;
    }

    serializeCommand(command) {
        const args = [command.command, ...command.args].map(arg => String(arg));
        return `*${args.length}\r\n${args.map(arg => `$${Buffer.byteLength(arg)}\r\n${arg}\r\n`).join('')}`;
    }

    writeData(data) {
        this.should_buffer = !this.stream.write(data);
    }

    readyCheck() {
        this.sendCommand({ command: 'info', callback: this.onInfoCmd.bind(this) });
    }

    onInfoCmd(err, res) {
        if (err) {
            err.message = 'Ready check failed: ' + err.message;
            this.emit('error', err);
            return;
        }
        if (!res || !this.server_info.loading || this.server_info.loading === '0') {
            this.onReady();
        }
    }

    drain() {
        this.should_buffer = false;
    }
}

RedisClient.connectionId = 0;

util.inherits(RedisClient, EventEmitter);

exports.createClient = function (...args) {
    return new RedisClient(unifyOptions(...args));
};

exports.RedisClient = RedisClient;
exports.RedisError = RedisError;
exports.ParserError = ParserError;

// Additional helpers and utilities
require('./lib/individualCommands')(RedisClient);
require('./lib/extendedApi')(RedisClient);
require('./lib/customErrors')(exports);
