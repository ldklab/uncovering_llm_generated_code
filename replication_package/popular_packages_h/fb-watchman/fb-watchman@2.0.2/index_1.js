'use strict';

const net = require('net');
const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const bser = require('bser');

class Client extends EventEmitter {
  constructor(options = {}) {
    super();
    this.watchmanBinaryPath = options.watchmanBinaryPath?.trim() || 'watchman';
    this.commands = [];
    this.currentCommand = null;
    this.connecting = false;
    this.socket = null;
    this.bunser = null;
  }

  sendNextCommand() {
    if (this.currentCommand) return;

    this.currentCommand = this.commands.shift();
    if (!this.currentCommand) return;

    this.socket.write(bser.dumpToBuffer(this.currentCommand.cmd));
  }

  cancelCommands(reason) {
    const error = new Error(reason);
    if (this.currentCommand) {
      this.commands.unshift(this.currentCommand);
      this.currentCommand = null;
    }
    this.commands.forEach(cmd => cmd.cb(error));
    this.commands = [];
  }

  connect() {
    const makeSock = (sockname) => {
      this.bunser = new bser.BunserBuf();
      this.bunser.on('value', (obj) => {
        const unilateral = unilateralTags.find(tag => tag in obj);
        if (unilateral) {
          this.emit(unilateral, obj);
        } else if (this.currentCommand) {
          const { cb } = this.currentCommand;
          this.currentCommand = null;
          cb(obj.error ? new Error(obj.error) : null, obj);
        }
        this.sendNextCommand();
      });
      this.bunser.on('error', (err) => this.emit('error', err));

      this.socket = net.createConnection(sockname);
      this.socket.on('connect', () => {
        this.connecting = false;
        this.emit('connect');
        this.sendNextCommand();
      }).on('error', (err) => {
        this.connecting = false;
        this.emit('error', err);
      }).on('data', (buf) => this.bunser.append(buf))
        .on('end', () => {
          this.socket = null;
          this.bunser = null;
          this.cancelCommands('The watchman connection was closed');
          this.emit('end');
        });
    };

    if (process.env.WATCHMAN_SOCK) {
      makeSock(process.env.WATCHMAN_SOCK);
      return;
    }

    const args = ['--no-pretty', 'get-sockname'];
    let spawnFailed = false;

    const spawnError = (error) => {
      if (spawnFailed) return;
      spawnFailed = true;
      error.message = error.code === 'EACCES'
        ? 'The Watchman CLI is installed but has permission issues'
        : 'Watchman not found. Install from: https://facebook.github.io/watchman/docs/install.html';

      console.error('Watchman:', error.message);
      this.emit('error', error);
    };

    let proc;
    try {
      proc = spawn(this.watchmanBinaryPath, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    } catch (error) {
      spawnError(error);
      return;
    }

    const stdout = [];
    const stderr = [];

    proc.stdout.on('data', data => stdout.push(data));
    proc.stderr.on('data', data => {
      data = data.toString('utf8');
      stderr.push(data);
      console.error(data);
    });
    proc.on('error', spawnError);

    proc.on('close', (code, signal) => {
      if (code !== 0) {
        spawnError(new Error(`${this.watchmanBinaryPath} ${args.join(' ')} returned with code=${code}, signal=${signal}, stderr=${stderr.join('')}`));
        return;
      }
      try {
        const obj = JSON.parse(stdout.join(''));
        if (obj.error) {
          this.emit('error', new Error(obj.error));
          return;
        }
        makeSock(obj.sockname);
      } catch (err) {
        this.emit('error', err);
      }
    });
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

  static compareVersions(a, b) {
    const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
    const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
    return aMajor !== bMajor ? aMajor - bMajor : aMinor !== bMinor ? aMinor - bMinor : aPatch - bPatch;
  }

  static haveCapability(version, name) {
    const cap_versions = {
      "cmd-watch-del-all": "3.1.1",
      "cmd-watch-project": "3.1",
      "relative_root": "3.3",
      "term-dirname": "3.1",
      "term-idirname": "3.1",
      "wildmatch": "3.7",
    };
    return name in cap_versions && Client.compareVersions(version, cap_versions[name]) >= 0;
  }

  capabilityCheck(caps, done) {
    const optional = caps.optional || [];
    const required = caps.required || [];
    this.command(['version', { optional, required }], (error, resp) => {
      if (error) {
        done(error);
        return;
      }
      if (!resp.capabilities) {
        resp = this._synthesizeCapabilityCheck(resp, optional, required);
        if (resp.error) {
          done(new Error(resp.error));
          return;
        }
      }
      done(null, resp);
    });
  }

  _synthesizeCapabilityCheck(resp, optional, required) {
    const capabilities = resp.capabilities = {};
    optional.forEach(name => capabilities[name] = Client.haveCapability(resp.version, name));
    required.forEach(name => {
      if (!(capabilities[name] = Client.haveCapability(resp.version, name))) {
        resp.error = `client required capability \`${name}\` is not supported by this server`;
      }
    });
    return resp;
  }

  end() {
    this.cancelCommands('The client was ended');
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
    this.bunser = null;
  }
}

const unilateralTags = ['subscription', 'log'];

module.exports.Client = Client;
