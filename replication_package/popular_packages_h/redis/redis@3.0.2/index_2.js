'use strict';

const net = require('net');
const tls = require('tls');
const EventEmitter = require('events');
const util = require('util');
const utils = require('./lib/utils');
const Command = require('./lib/command');
const Queue = require('denque');
const { AbortError, AggregateError } = require('./lib/customErrors');
const RedisErrors = require('redis-errors');
const debug = require('./lib/debug');
const unifyOptions = require('./lib/createClient');
const Parser = require('redis-parser');

const SUBSCRIBE_COMMANDS = {
    subscribe: true,
    unsubscribe: true,
    psubscribe: true,
    punsubscribe: true,
};

function noop() {}

class RedisClient extends EventEmitter {
    constructor(options, stream) {
        super();
        options = utils.clone(options);
        const cnx_options = {};
        for (const tls_option in options.tls) {
            cnx_options[tls_option] = options.tls[tls_option];
            if (['port', 'host', 'path', 'family'].includes(tls_option)) {
                options[tls_option] = options.tls[tls_option];
            }
        }
        this.connection_options = cnx_options;
        this.connection_id = RedisClient.connection_id++;
        this.connected = false;
        this.ready = false;
        this.options = options;
        this.stream = stream || this.create_stream();
        this.server_info = {};
        this.setDefaultOptions();
        this.initialize_instance_variables();
        this.create_parser();
    }

    setDefaultOptions() {
        if (this.options.socket_keepalive === undefined) {
            this.options.socket_keepalive = true;
        }
        if (this.options.socket_initial_delay === undefined) {
            this.options.socket_initial_delay = 0;
        }
        if (!this.options.enable_offline_queue) {
            this.options.enable_offline_queue = true;
        }
    }

    initialize_instance_variables() {
        this.command_queue = new Queue();
        this.offline_queue = new Queue();
        this.pipeline_queue = new Queue();
        this.sub_commands_left = 0;
        this.pub_sub_mode = 0;
        this.subscription_set = {};
        this.auth_pass = this.options.auth_pass || this.options.password;
        this.selected_db = this.options.db;
        this.buffers = this.options.return_buffers || this.options.detect_buffers;
        this.monitoring = this.should_buffer = this.closing = this.pipeline = false;
        this.reply = 'ON';
        this.initialize_retry_vars();
        this.debug_mode = /\bredis\b/i.test(process.env.NODE_DEBUG);
    }

    create_parser() {
        this.reply_parser = new Parser({
            returnReply: (data) => this.return_reply(data),
            returnError: (err) => this.return_error(err),
            returnFatalError: (err) => this.handle_fatal_error(err),
            returnBuffers: this.buffers || this.message_buffers,
            stringNumbers: this.options.string_numbers || false
        });
    }

    create_stream() {
        if (this.stream) {
            this.clear_stream();
        }
        if (this.options.stream) {
            this.stream = this.options.stream;
        } else {
            this.stream = this.options.tls ? tls.connect(this.connection_options) :
                                             net.createConnection(this.connection_options);
        }
        this.attach_stream_events();
        return this.stream;
    }

    attach_stream_events() {
        this.stream.setNoDelay();

        const connectEvent = this.options.tls ? 'secureConnect' : 'connect';
        this.stream.once(connectEvent, () => this.on_connect());
        this.stream.on('data', (data) => this.reply_parser.execute(data));
        this.stream.on('error', (err) => this.on_error(err));
        this.stream.once('close', (hadError) => this.connection_gone('close'));
        this.stream.once('end', () => this.connection_gone('end'));
        this.stream.on('drain', () => this.drain());

        if (this.options.connect_timeout) {
            this.stream.setTimeout(this.connect_timeout, () => this.connection_gone('timeout'));
        }
    }

    clear_stream() {
        this.stream.removeAllListeners();
        this.stream.destroy();
    }

    on_connect() {
        this.connected = true;
        this.ready = false;
        this.stream.setKeepAlive(this.options.socket_keepalive, this.options.socket_initial_delay);
        this.stream.setTimeout(0);
        this.emit('connect');
        this.initialize_retry_vars();

        if (this.options.no_ready_check) {
            this.on_ready();
        } else {
            this.ready_check();
        }
    }

    initialize_retry_vars() {
        this.retry_timer = null;
        this.retry_totaltime = 0;
        this.retry_delay = 200;
        this.retry_backoff = 1.7;
        this.attempts = 1;
    }

    // ... (other methods related to command handling, parsing, etc.)

    connection_gone(reason, error) {
        if (this.retry_timer) return;
        error = error || null;
        
        this.emit_end();
        this.handle_retry();

        if (this.should_buffer || this.command_queue.length !== 0) {
            this.manage_command_queue(error);
        }
        this.retry(error);
    }

    emit_end() {
        if (!this.emitted_end) {
            this.emit('end');
            this.emitted_end = true;
        }
    }

    handle_retry() {
        if (this.closing) {
            this.end();
            return;
        }
        this.ready = this.connected = false;
        this.command_queue = [];
        if (typeof this.options.retry_strategy === 'function') {
            this.retry_delay = this.options.retry_strategy({
                attempt: this.attempts,
                error: error
            });
        }
    }

    manage_command_queue(error) {
        if (this.retry_totaltime >= this.connect_timeout) {
            this.end(true, error);
            return;
        }
        if (this.options.retry_unfulfilled_commands) {
            this.offline_queue.unshift(...this.command_queue.toArray());
            this.command_queue.clear();
        } else {
            this.flush_and_error_queue(['command_queue'], error);
        }
    }

    flush_and_error_queue(queues, error) {
        queues.forEach(queue => {
            while (let command_obj = this[queue].shift()) {
                const err = new AbortError({ message: 'Connection lost', ...error });
                if (command_obj.callback) {
                    command_obj.callback(err);
                }
            }
        });
    }

    retry(error) {
        if (this.retry_totaltime + this.retry_delay > this.connect_timeout) {
            this.retry_delay = this.connect_timeout - this.retry_totaltime;
        }
        this.retry_timer = setTimeout(retry_connection, this.retry_delay, this, error);
    }
}

util.inherits(RedisClient, EventEmitter);
RedisClient.connection_id = 0;

exports.createClient = function() {
    return new RedisClient(unifyOptions.apply(null, arguments));
};

// Export classes and errors
exports.RedisClient = RedisClient;
exports.AbortError = AbortError;
exports.RedisError = RedisErrors.RedisError;

require('./lib/individualCommands');
require('./lib/extendedApi');

exports.addCommand = require('./lib/commands');
