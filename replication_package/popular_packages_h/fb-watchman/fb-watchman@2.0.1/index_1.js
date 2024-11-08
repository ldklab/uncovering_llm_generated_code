'use strict';

const net = require('net');
const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const bser = require('bser');

class Client extends EventEmitter {
  constructor(options = {}) {
    super();
    this.watchmanBinaryPath = options.watchmanBinaryPath ? options.watchmanBinaryPath.trim() : 'watchman';
    this.commands = [];
    this.currentCommand = null;
    this.connecting = false;
  }

  sendNextCommand() {
    if (this.currentCommand) return;

    this.currentCommand = this.commands.shift();
    if (!this.currentCommand) return;

    this.socket.write(bser.dumpToBuffer(this.currentCommand.cmd));
  }

  cancelCommands(reason) {
    const error = new Error(reason);
    const cmds = [...this.commands];
    this.commands = [];

    if (this.currentCommand) {
      cmds.unshift(this.currentCommand);
      this.currentCommand = null;
    }

    cmds.forEach(cmd => cmd.cb(error));
  }

  connect() {
    const handleSock = sockname => {
      this.bunser = new bser.BunserBuf();
      this.bunser.on('value', this.handleResponse.bind(this));
      this.bunser.on('error', err => this.emit('error', err));

      this.socket = net.createConnection(sockname);
      this.socket.on('connect', () => {
        this.connecting = false;
        this.emit('connect');
        this.sendNextCommand();
      });
      this.socket.on('error', err => {
        this.connecting = false;
        this.emit('error', err);
      });
      this.socket.on('data', buf => this.bunser.append(buf));
      this.socket.on('end', () => {
        this.socket = null;
        this.bunser = null;
        this.cancelCommands('The watchman connection was closed');
        this.emit('end');
      });
    };

    if (process.env.WATCHMAN_SOCK) {
      handleSock(process.env.WATCHMAN_SOCK);
      return;
    }

    const args = ['--no-pretty', 'get-sockname'];
    try {
      const proc = spawn(this.watchmanBinaryPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });

      const stdout = [];
      const stderr = [];
      proc.stdout.on('data', data => stdout.push(data));
      proc.stderr.on('data', data => {
        data = data.toString('utf8');
        stderr.push(data);
        console.error(data);
      });

      proc.on('error', this.spawnErrorHandler.bind(this));
      
      proc.on('close', (code, signal) => {
        if (code !== 0) {
          const error = new Error(`${this.watchmanBinaryPath} ${args.join(' ')} returned with exit code=${code}, signal=${signal}, stderr=${stderr.join('')}`);
          this.spawnErrorHandler(error);
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
          handleSock(obj.sockname);
        } catch (e) {
          this.emit('error', e);
        }
      });
    } catch (error) {
      this.spawnErrorHandler(error);
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

  spawnErrorHandler(error) {
    if (error.errno === 'EACCES') {
      error.message = 'The Watchman CLI is installed but cannot be spawned because of a permission problem';
    } else if (error.errno === 'ENOENT') {
      error.message = 'Watchman was not found in PATH. See https://facebook.github.io/watchman/docs/install.html for installation instructions';
    }
    console.error('Watchman: ', error.message);
    this.emit('error', error);
  }

  command(args, done = () => {}) {
    this.commands.push({ cmd: args, cb: done });

    if (!this.socket) {
      if (!this.connecting) {
        this.connecting = true;
        this.connect();
      }
      return;
    }

    this.sendNextCommand();
  }

  static vers_compare(a, b) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      const diff = (aParts[i] || 0) - (bParts[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  static have_cap(vers, name) {
    if (cap_versions[name]) {
      return Client.vers_compare(vers, cap_versions[name]) >= 0;
    }
    return false;
  }

  _synthesizeCapabilityCheck(resp, optional, required) {
    resp.capabilities = {};
    const version = resp.version;
    optional.forEach(name => {
      resp.capabilities[name] = Client.have_cap(version, name);
    });
    required.forEach(name => {
      const have = Client.have_cap(version, name);
      resp.capabilities[name] = have;
      if (!have) {
        resp.error = `client required capability '${name}' is not supported by this server`;
      }
    });
    return resp;
  }

  capabilityCheck(caps, done) {
    const { optional = [], required = [] } = caps;
    this.command(['version', { optional, required }], (error, resp) => {
      if (error) {
        done(error);
        return;
      }
      if (!('capabilities' in resp)) {
        resp = this._synthesizeCapabilityCheck(resp, optional, required);
        if (resp.error) {
          const err = new Error(resp.error);
          err.watchmanResponse = resp;
          done(err);
          return;
        }
      }
      done(null, resp);
    });
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

const cap_versions = {
  "cmd-watch-del-all": "3.1.1",
  "cmd-watch-project": "3.1",
  "relative_root": "3.3",
  "term-dirname": "3.1",
  "term-idirname": "3.1",
  "wildmatch": "3.7",
};

module.exports.Client = Client;
