'use strict';

const net = require('net');
const EventEmitter = require('events');
const { spawn } = require('child_process');
const bser = require('bser');

const unilateralTags = ['subscription', 'log'];

class Client extends EventEmitter {
  constructor(options = {}) {
    super();
    this.watchmanBinaryPath = options.watchmanBinaryPath?.trim() || 'watchman';
    this.commands = [];
  }

  sendNextCommand() {
    if (this.currentCommand || !this.socket) return;

    this.currentCommand = this.commands.shift();
    if (this.currentCommand) {
      this.socket.write(bser.dumpToBuffer(this.currentCommand.cmd));
    }
  }

  cancelCommands(reason) {
    const error = new Error(reason);
    const pendingCommands = this.commands;
    this.commands = [];

    if (this.currentCommand) {
      pendingCommands.unshift(this.currentCommand);
      this.currentCommand = null;
    }
    
    for (const cmd of pendingCommands) {
      cmd.cb(error);
    }
  }

  connect() {
    const setupSocket = (sockname) => {
      this.bunser = new bser.BunserBuf();
      this.bunser.on('value', this.processResponse.bind(this));
      this.bunser.on('error', (err) => this.emit('error', err));

      this.socket = net.createConnection(sockname);
      this.socket.on('connect', () => {
        this.connecting = false;
        this.emit('connect');
        this.sendNextCommand();
      });
      this.socket.on('error', (err) => {
        this.connecting = false;
        this.emit('error', err);
      });
      this.socket.on('data', (buf) => this.bunser.append(buf));
      this.socket.on('end', () => {
        this.socket = null;
        this.bunser = null;
        this.cancelCommands('The watchman connection was closed');
        this.emit('end');
      });
    };

    if (process.env.WATCHMAN_SOCK) {
      return setupSocket(process.env.WATCHMAN_SOCK);
    }
    
    const args = ['--no-pretty', 'get-sockname'];
    let proc;
    let spawnFailed = false;

    const handleSpawnError = (error) => {
      if (spawnFailed) return;
      spawnFailed = true;
      if (['EACCES', 'ENOENT'].includes(error.code)) {
        error.message = error.code === 'EACCES'
          ? 'The Watchman CLI is installed but cannot be spawned due to a permission problem'
          : 'Watchman was not found in PATH. See watchman docs for installation instructions';
      }
      console.error('Watchman:', error.message);
      this.emit('error', error);
    };

    try {
      proc = spawn(this.watchmanBinaryPath, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    } catch (error) {
      return handleSpawnError(error);
    }

    const stdout = [];
    proc.stdout.on('data', (data) => stdout.push(data));
    proc.stderr.on('data', (data) => console.error(data.toString('utf8')));
    proc.on('error', handleSpawnError);
    proc.on('close', (code, signal) => {
      if (code !== 0) {
        return handleSpawnError(new Error(`${this.watchmanBinaryPath} ${args.join(' ')} exited with code=${code}, signal=${signal}`));
      }
      try {
        const response = JSON.parse(stdout.join(''));
        if (response.error) {
          const err = new Error(response.error);
          err.watchmanResponse = response;
          return this.emit('error', err);
        }
        setupSocket(response.sockname);
      } catch (e) {
        this.emit('error', e);
      }
    });
  }

  processResponse(obj) {
    const unilateral = unilateralTags.find(tag => tag in obj);

    if (unilateral) {
      this.emit(unilateral, obj);
    } else if (this.currentCommand) {
      const cmd = this.currentCommand;
      this.currentCommand = null;
      
      const cbError = obj.error ? new Error(obj.error) : null;
      if (cbError) cbError.watchmanResponse = obj;
      
      cmd.cb(cbError, obj);
    }

    this.sendNextCommand();
  }

  command(args, done = () => {}) {
    this.commands.push({ cmd: args, cb: done });

    if (!this.socket && !this.connecting) {
      this.connecting = true;
      this.connect();
    } else {
      this.sendNextCommand();
    }
  }

  capabilityCheck(caps, done) {
    const request = ['version', { optional: caps.optional || [], required: caps.required || [] }];
    this.command(request, (error, resp) => {
      if (error) return done(error);

      if (!resp.capabilities) {
        resp = this._synthesizeCapabilityCheck(resp, request[1].optional, request[1].required);
        if (resp.error) {
          const err = new Error(resp.error);
          err.watchmanResponse = resp;
          return done(err);
        }
      }
      done(null, resp);
    });
  }

  _synthesizeCapabilityCheck(resp, optional, required) {
    resp.capabilities = {};
    const version = resp.version;
    optional.forEach(name => { resp.capabilities[name] = this.haveCap(version, name); });
    required.forEach(name => {
      const have = this.haveCap(version, name);
      resp.capabilities[name] = have;
      if (!have) {
        resp.error = `client required capability \`${name}\` is not supported by this server`;
      }
    });
    return resp;
  }

  haveCap(vers, name) {
    return name in Client.capabilityVersions && Client.versCompare(vers, Client.capabilityVersions[name]) >= 0;
  }

  static versCompare(a, b) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      const diff = (aParts[i] || 0) - (bParts[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  static capabilityVersions = {
    "cmd-watch-del-all": "3.1.1",
    "cmd-watch-project": "3.1",
    "relative_root": "3.3",
    "term-dirname": "3.1",
    "term-idirname": "3.1",
    "wildmatch": "3.7"
  };

  end() {
    this.cancelCommands('The client was ended');
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
    this.bunser = null;
  }
}

module.exports.Client = Client;
