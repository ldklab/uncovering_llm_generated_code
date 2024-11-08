'use strict';

const net = require('net');
const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const bser = require('bser');

const unilateralTags = ['subscription', 'log'];

class Client extends EventEmitter {
  constructor(options = {}) {
    super();
    this.watchmanBinaryPath = options.watchmanBinaryPath ? options.watchmanBinaryPath.trim() : 'watchman';
    this.commands = [];
    this.socket = null;
    this.bunser = null;
    this.currentCommand = null;
    this.connecting = false;
  }

  sendNextCommand() {
    if (this.currentCommand || this.commands.length === 0) return;
    this.currentCommand = this.commands.shift();
    this.socket.write(bser.dumpToBuffer(this.currentCommand.cmd));
  }

  cancelCommands(why) {
    const error = new Error(why);
    const cmds = this.commands;
    this.commands = [];
    if (this.currentCommand) {
      cmds.unshift(this.currentCommand);
      this.currentCommand = null;
    }
    cmds.forEach(cmd => cmd.cb(error));
  }

  makeSock(sockname) {
    this.bunser = new bser.BunserBuf();
    this.bunser.on('value', (obj) => this.handleResponse(obj));
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
    this.socket.on('data', (buf) => this.bunser && this.bunser.append(buf));
    this.socket.on('end', () => this.closeConnection('The watchman connection was closed'));
  }

  connect() {
    if (process.env.WATCHMAN_SOCK) {
      this.makeSock(process.env.WATCHMAN_SOCK);
      return;
    }

    const proc = this.spawnWatchman(['--no-pretty', 'get-sockname']);
    if (!proc) return;

    const stdout = [];
    const stderr = [];
    proc.stdout.on('data', (data) => stdout.push(data));
    proc.stderr.on('data', (data) => process.stderr.write(data.toString('utf8')) && stderr.push(data.toString('utf8')));
    proc.on('close', (code, signal) => this.handleProcessClose(code, signal, stderr, stdout));
    proc.on('error', (error) => this.spawnError(error));
  }

  spawnWatchman(args) {
    try {
      return spawn(this.watchmanBinaryPath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });
    } catch (error) {
      this.spawnError(error);
      return null;
    }
  }

  handleProcessClose(code, signal, stderr, stdout) {
    if (code !== 0) {
      this.spawnError(new Error(`${this.watchmanBinaryPath} returned code=${code}, signal=${signal}, stderr=${stderr.join('')}`));
      return;
    }
    try {
      const obj = JSON.parse(stdout.join(''));
      if ('error' in obj) {
        const error = new Error(obj.error);
        error.watchmanResponse = obj;
        this.emit('error', error);
        return;
      }
      this.makeSock(obj.sockname);
    } catch (e) {
      this.emit('error', e);
    }
  }

  handleResponse(obj) {
    const unilateral = unilateralTags.find(tag => tag in obj);
    if (unilateral) {
      this.emit(unilateral, obj);
    } else if (this.currentCommand) {
      const cmd = this.currentCommand;
      this.currentCommand = null;
      if ('error' in obj) {
        const error = new Error(obj.error);
        error.watchmanResponse = obj;
        cmd.cb(error);
      } else {
        cmd.cb(null, obj);
      }
    }
    this.sendNextCommand();
  }

  spawnError(error) {
    if (error.code === 'EACCES') {
      error.message = 'The Watchman CLI cannot be spawned due to permission problems';
    } else if (error.code === 'ENOENT') {
      error.message = 'Watchman not found in PATH. See installation instructions.';
    }
    console.error('Watchman: ', error.message);
    this.emit('error', error);
  }

  command(args, callback = () => {}) {
    this.commands.push({ cmd: args, cb: callback });
    if (!this.socket && !this.connecting) {
      this.connecting = true;
      this.connect();
      return;
    }
    if (this.socket) this.sendNextCommand();
  }

  end() {
    this.cancelCommands('The client was ended');
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
    this.bunser = null;
  }

  static vers_compare(a, b) {
    const partsA = a.split('.');
    const partsB = b.split('.');
    for (let i = 0; i < 3; i++) {
      const diff = parseInt(partsA[i] || '0') - parseInt(partsB[i] || '0');
      if (diff !== 0) return diff;
    }
    return 0;
  }

  static have_cap(vers, name) {
    return name in cap_versions && this.vers_compare(vers, cap_versions[name]) >= 0;
  }

  _synthesizeCapabilityCheck(resp, optional, required) {
    resp.capabilities = {};
    const version = resp.version;
    optional.forEach(name => resp.capabilities[name] = Client.have_cap(version, name));
    required.forEach(name => {
      const hasCap = Client.have_cap(version, name);
      resp.capabilities[name] = hasCap;
      if (!hasCap) {
        resp.error = `client required capability '${name}' is not supported by this server`;
      }
    });
    return resp;
  }

  capabilityCheck(caps, callback) {
    const optional = caps.optional || [];
    const required = caps.required || [];
    this.command(['version', { optional, required }], (error, resp) => {
      if (error) {
        callback(error);
        return;
      }
      if (!('capabilities' in resp)) {
        resp = this._synthesizeCapabilityCheck(resp, optional, required);
        if (resp.error) {
          callback(new Error(resp.error), resp);
          return;
        }
      }
      callback(null, resp);
    });
  }

  closeConnection(message) {
    this.socket = null;
    this.bunser = null;
    this.cancelCommands(message);
    this.emit('end');
  }
}

const cap_versions = {
  "cmd-watch-del-all": "3.1.1",
  "cmd-watch-project": "3.1",
  "relative_root": "3.3",
  "term-dirname": "3.1",
  "term-idirname": "3.1",
  "wildmatch": "3.7",
};

module.exports = { Client };
