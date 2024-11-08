'use strict';

const net = require('net');
const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const bser = require('bser');

const unilateralTags = ['subscription', 'log'];

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
    if (this.currentCommand) {
      this.socket.write(bser.dumpToBuffer(this.currentCommand.cmd));
    }
  }

  cancelCommands(why) {
    const error = new Error(why);
    const cmds = [this.currentCommand, ...this.commands];
    this.currentCommand = null;
    this.commands = [];

    cmds.forEach(cmd => cmd?.cb(error));
  }

  connect() {
    const makeSock = (sockname) => {
      this.bunser = new bser.BunserBuf();
      this.bunser.on('value', (obj) => {
        const unilateral = unilateralTags.find(tag => obj.hasOwnProperty(tag));
        if (unilateral) {
          this.emit(unilateral, obj);
        } else if (this.currentCommand) {
          const cmd = this.currentCommand;
          this.currentCommand = null;
          cmd.cb(obj.error ? new Error(obj.error) : null, obj);
        }
        this.sendNextCommand();
      });
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
        this.socket = this.bunser = null;
        this.cancelCommands('The watchman connection was closed');
        this.emit('end');
      });
    };

    if (process.env.WATCHMAN_SOCK) {
      makeSock(process.env.WATCHMAN_SOCK);
      return;
    }

    const args = ['--no-pretty', 'get-sockname'];
    let proc;
    let spawnFailed = false;

    const spawnError = (error) => {
      if (spawnFailed) return;
      spawnFailed = true;
      error.message = error.code === 'EACCES' ? 
        'The Watchman CLI is installed but has a permission problem' : 
        'Watchman was not found in PATH. See https://facebook.github.io/watchman/docs/install.html for instructions';
      console.error('Watchman:', error.message);
      this.emit('error', error);
    };

    try {
      proc = spawn(this.watchmanBinaryPath, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    } catch (error) {
      spawnError(error);
      return;
    }

    const stdout = [];
    proc.stdout.on('data', (data) => stdout.push(data));
    proc.stderr.on('data', (data) => console.error(data.toString('utf8')));
    proc.on('error', spawnError);
    proc.on('close', (code, signal) => {
      if (code === 0) {
        try {
          const obj = JSON.parse(stdout.join(''));
          if (obj.error) {
            const error = new Error(obj.error);
            error.watchmanResponse = obj;
            this.emit('error', error);
          } else {
            makeSock(obj.sockname);
          }
        } catch (e) {
          this.emit('error', e);
        }
      } else {
        spawnError(new Error(`${this.watchmanBinaryPath} ${args.join(' ')} failed with code=${code}, signal=${signal}`));
      }
    });
  }

  command(args, done = () => {}) {
    this.commands.push({ cmd: args, cb: done });
    if (!this.socket) {
      if (!this.connecting) {
        this.connecting = true;
        this.connect();
      }
    } else {
      this.sendNextCommand();
    }
  }

  _synthesizeCapabilityCheck(resp, optional, required) {
    const version = resp.version;
    const capabilities = {};
    optional.forEach(name => capabilities[name] = have_cap(version, name));
    required.forEach(name => {
      const available = have_cap(version, name);
      capabilities[name] = available;
      if (!available) {
        resp.error = `client required capability \`${name}\` is not supported by this server`;
      }
    });
    resp.capabilities = capabilities;
    return resp;
  }

  capabilityCheck(caps, done) {
    const optional = caps.optional || [];
    const required = caps.required || [];
    this.command(['version', { optional, required }], (error, resp) => {
      if (error) return done(error);
      if (!resp.capabilities) {
        resp = this._synthesizeCapabilityCheck(resp, optional, required);
        if (resp.error) return done(new Error(resp.error));
      }
      done(null, resp);
    });
  }

  end() {
    this.cancelCommands('The client was ended');
    this.socket?.end();
    this.socket = this.bunser = null;
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

function vers_compare(a, b) {
  const aParts = a.split('.').map(num => parseInt(num) || 0);
  const bParts = b.split('.').map(num => parseInt(num) || 0);
  for (let i = 0; i < 3; i++) {
    const diff = aParts[i] - bParts[i];
    if (diff !== 0) return diff;
  }
  return 0;
}

function have_cap(vers, name) {
  return (name in cap_versions) ? vers_compare(vers, cap_versions[name]) >= 0 : false;
}

module.exports.Client = Client;
