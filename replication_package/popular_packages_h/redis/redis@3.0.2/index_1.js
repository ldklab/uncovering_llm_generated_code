'use strict';

const net = require('net');
const tls = require('tls');
const util = require('util');
const EventEmitter = require('events');
const Parser = require('redis-parser');
const RedisErrors = require('redis-errors');
const Queue = require('denque');
const utils = require('./lib/utils');
const Command = require('./lib/command');
const errorClasses = require('./lib/customErrors');
const debug = require('./lib/debug');
const unifyOptions = require('./lib/createClient');

const SUBSCRIBE_COMMANDS = ['subscribe', 'unsubscribe', 'psubscribe', 'punsubscribe'];

function noop() {}

class RedisClient extends EventEmitter {
    constructor(options, stream) {
        super();
        options = utils.clone(options);
        this.connection_options = {};
        this.stream = stream;
        this.initializeOptions(options);
        this.createStream();
    }

    initializeOptions(options) {
        const { tls } = options;
        this.connection_options = { ...tls, port: options.port || 6379, host: options.host || '127.0.0.1' };
        this.connected = this.ready = false;
        this.should_buffer = false;
        this.command_queue = new Queue();
        this.offline_queue = new Queue();
        this.pipeline_queue = new Queue();
        this.initialize_retry_vars();
        // Additional options setup here...
    }

    createStream() {
        this.reply_parser = this.createParser();
        if (this.options.stream) {
            this.stream = this.options.stream;
            return;
        }
        this.stream = this.options.tls 
            ? tls.connect(this.connection_options) 
            : net.createConnection(this.connection_options);

        this.setupStreamListeners();
    }
    
    createParser() {
        return new Parser({
            returnReply: this.return_reply.bind(this),
            returnError: this.return_error.bind(this),
            returnFatalError: this.handleFatalError.bind(this),
            returnBuffers: this.buffers || this.message_buffers,
            stringNumbers: this.options.string_numbers || false
        });
    }
    
    setupStreamListeners() {
        const connect_event = this.options.tls ? 'secureConnect' : 'connect';
        this.stream.once(connect_event, this.on_connect.bind(this));
        this.stream.on('data', this.handleData.bind(this));
        this.stream.on('error', this.on_error.bind(this));
        this.stream.once('close', this.connection_gone.bind(this, 'close'));
        this.stream.once('end', this.connection_gone.bind(this, 'end'));
        this.stream.on('drain', this.drain.bind(this));
        this.stream.setNoDelay();

        if (this.options.connect_timeout) {
            this.stream.setTimeout(this.options.connect_timeout, this.handleTimeout.bind(this));
        }
    }
    
    on_connect() {
        this.connected = true;
        this.stream.setKeepAlive(this.options.socket_keepalive, this.options.socket_initial_delay);
        this.initialize_retry_vars();
        this.emit('connect');
        if (!this.options.no_ready_check) {
            this.ready_check();
        } else {
            this.on_ready();
        }
    }
    
    ready_check() {
        this.ready = true;
        this.info(this.on_info_cmd.bind(this));
        this.ready = false;
    }

    on_ready() {
        this.ready = true;
        this.send_offline_queue();
        this.emit('ready');
    }
    
    on_error(err) {
        if (this.closing) return;
        debug(`Connection error: ${err.message}`);
        this.connection_gone('error', err);
    }

    connection_gone(why, error) {
        if (this.retry_timer) return;
        error = error || null;
        this.connected = false;
        this.ready = false;
        if (!this.emitted_end) {
            this.emit('end');
            this.emitted_end = true;
        }
        // Retry logic here...
    }

    handleData(data) {
        debug(`Received data on ${this.address}: ${data.toString()}`);
        this.reply_parser.execute(data);
    }

    handleFatalError(err) {
        err.message += ' Please report this.';
        this.ready = false;
        this.flush_and_error({ message: 'Fatal error occurred.', code: 'NR_FATAL' }, { error: err });
        this.emit('error', err);
        this.create_stream();
    }

    flush_and_error(errorAttributes, options = {}) {
        const queueNames = options.queues || ['command_queue', 'offline_queue'];
        queueNames.forEach(queueName => {
            let command;
            while (command = this[queueName].shift()) {
                const err = new errorClasses.AbortError(errorAttributes);
                if (command.callback) {
                    command.callback(err);
                }
            }
        });
    }

    internal_send_command(command_obj) {
        const { command, args } = command_obj;
        if (!this.ready || !this.stream.writable) {
            handle_offline_command(this, command_obj);
            return false;
        }
        
        let command_str = `*${args.length + 1}\r\n$${command.length}\r\n${command}\r\n`;
        args.forEach(arg => {
            const argStr = typeof arg === 'string' ? arg : Buffer.from(arg).toString('utf8');
            command_str += `$${Buffer.byteLength(argStr)}\r\n${argStr}\r\n`;
        });

        debug(`Sending command: ${command_str}`);
        this.write(command_str);
        this.command_queue.push(command_obj);
        return !this.should_buffer;
    }

    return_reply(reply) {
        if (this.pub_sub_mode) {
            return_pub_sub(this, reply);
        } else {
            normal_reply(this, reply);
        }
    }

    return_error(err) {
        const command_obj = this.command_queue.shift();
        if (command_obj.callback) {
            command_obj.callback(err);
        } else {
            this.emit('error', err);
        }
    }

    initialize_retry_vars() {
        this.retry_timer = null;
        this.retry_totaltime = this.retry_delay = this.retry_backoff = 0;
        this.attempts = 1;
    }

    drain() {
        this.should_buffer = false;
    }

    write(data) {
        this.should_buffer = !this.stream.write(data);
    }
}

util.inherits(RedisClient, EventEmitter);

function handle_offline_command(self, command_obj) {
    const command = command_obj.command.toUpperCase();
    let errMsg;
    if (self.closing || !self.enable_offline_queue) {
        errMsg = `Can't process ${command}. Connection closed or offline queue disabled.`;
        const error = new errorClasses.AbortError({ message: errMsg, command });
        if (command_obj.callback) {
            command_obj.callback(error);
        }
    } else {
        debug(`Queueing ${command} for connection.`);
        self.offline_queue.push(command_obj);
    }
    self.should_buffer = true;
}

exports.createClient = function (...args) {
    return new RedisClient(unifyOptions.apply(null, args));
};

exports.RedisClient = RedisClient;
exports.print = utils.print;
exports.Multi = require('./lib/multi');
exports.AbortError = errorClasses.AbortError;
exports.RedisError = RedisErrors.RedisError;
exports.ParserError = RedisErrors.ParserError;
exports.ReplyError = RedisErrors.ReplyError;
exports.AggregateError = errorClasses.AggregateError;

require('./lib/individualCommands');
require('./lib/extendedApi');

exports.addCommand = require('./lib/commands');
