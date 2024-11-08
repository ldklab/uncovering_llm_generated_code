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
  }

  sendNextCommand() {
    if (this.currentCommand) return;

    this.currentCommand = this.commands.shift();
    if (!this.currentCommand) return;
    
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

  connect() {
    const self = this;

    function makeSock(sockname) {
      self.bunser = new bser.BunserBuf();
      self.bunser.on('value', obj => {
        const unilateral = unilateralTags.find(tag => tag in obj);
        if (unilateral) {
          self.emit(unilateral, obj);
        } else if (self.currentCommand) {
          const cmd = self.currentCommand;
          self.currentCommand = null;
          if ('error' in obj) {
            const error = new Error(obj.error);
            error.watchmanResponse = obj;
            cmd.cb(error);
          } else {
            cmd.cb(null, obj);
          }
        }
        self.sendNextCommand();
      });

      self.bunser.on('error', err => self.emit('error', err));

      self.socket = net.createConnection(sockname);
      self.socket.on('connect', () => {
        self.connecting = false;
        self.emit('connect');
        self.sendNextCommand();
      })
      .on('error', err => {
        self.connecting = false;
        self.emit('error', err);
      })
      .on('data', buf => {
        self.bunser?.append(buf);
      })
      .on('end', () => {
        self.socket = null;
        self.bunser = null;
        self.cancelCommands('The watchman connection was closed');
        self.emit('end');
      });
    }

    if (process.env.WATCHMAN_SOCK) {
      makeSock(process.env.WATCHMAN_SOCK);
      return;
    }

    const args = ['--no-pretty', 'get-sockname'];
    let proc;
    let spawnFailed = false;

    function spawnError(error) {
      if (spawnFailed) return;
      spawnFailed = true;
      if (error.errno === 'EACCES') {
        error.message = 'The Watchman CLI cannot be spawned due to permission issues';
      } else if (error.errno === 'ENOENT') {
        error.message = 'Watchman not found in PATH. See installation instructions.';
      }
      console.error('Watchman: ', error.message);
      self.emit('error', error);
    }

    try {
      proc = spawn(this.watchmanBinaryPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (error) {
      spawnError(error);
      return;
    }

    const stdout = [];
    const stderr = [];
    proc.stdout.on('data', data => stdout.push(data));
    proc.stderr.on('data', data => {
      const msg = data.toString('utf8');
      stderr.push(msg);
      console.error(msg);
    });
    proc.on('error', spawnError);

    proc.on('close', (code, signal) => {
      if (code !== 0) {
        spawnError(new Error(`${self.watchmanBinaryPath} ${args.join(' ')} exited with code ${code}, signal ${signal}. Stderr: ${stderr.join('')}`));
        return;
      }
      try {
        const obj = JSON.parse(stdout.join(''));
        if ('error' in obj) {
          const error = new Error(obj.error);
          error.watchmanResponse = obj;
          self.emit('error', error);
          return;
        }
        makeSock(obj.sockname);
      } catch (e) {
        self.emit('error', e);
      }
    });
  }

  command(args, done = () => {}) {
    this.commands.push({ cmd: args, cb: done });

    if (!this.socket) {
      if (!this.connecting) {
        this.connecting = true;
        this.connect();
        return;
      }
      return;
    }
    this.sendNextCommand();
  }

  static vers_compare(a, b) {
    a = a.split('.');
    b = b.split('.');
    for (let i = 0; i < 3; i++) {
      const d = parseInt(a[i] || '0') - parseInt(b[i] || '0');
      if (d !== 0) return d;
    }
    return 0;
  }

  static have_cap(vers, name) {
    return Client.vers_compare(vers, cap_versions[name]) >= 0;
  }

  _synthesizeCapabilityCheck(resp, optional, required) {
    resp.capabilities = {};
    optional.forEach(name => resp.capabilities[name] = Client.have_cap(resp.version, name));
    required.forEach(name => {
      const have = Client.have_cap(resp.version, name);
      resp.capabilities[name] = have;
      if (!have) {
        resp.error = `client required capability \`${name}\` is not supported by this server`;
      }
    });
    return resp;
  }

  capabilityCheck(caps, done) {
    const optional = caps.optional || [];
    const required = caps.required || [];
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
    this.socket?.end();
    this.socket = null;
    this.bunser = null;
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

module.exports.Client = Client;
