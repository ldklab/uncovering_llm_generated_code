'use strict';

const net = require('net');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const childProcess = require('child_process');
const bser = require('bser');

const unilateralTags = ['subscription', 'log'];

function Client(options) {
  EventEmitter.call(this);

  this.watchmanBinaryPath = options?.watchmanBinaryPath?.trim() || 'watchman';
  this.commands = [];
}

util.inherits(Client, EventEmitter);

module.exports.Client = Client;

Client.prototype.sendNextCommand = function() {
  if (this.currentCommand) return;

  this.currentCommand = this.commands.shift();
  if (!this.currentCommand) return;

  this.socket.write(bser.dumpToBuffer(this.currentCommand.cmd));
}

Client.prototype.cancelCommands = function(why) {
  const error = new Error(why);

  const cmds = this.commands;
  this.commands = [];

  if (this.currentCommand) {
    cmds.unshift(this.currentCommand);
    this.currentCommand = null;
  }

  cmds.forEach(cmd => cmd.cb(error));
}

Client.prototype.connect = function() {
  const self = this;

  function makeSock(sockname) {
    self.bunser = new bser.BunserBuf();
    self.bunser.on('value', function(obj) {
      let unilateral = unilateralTags.some(tag => tag in obj) ? tag : false;

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
    self.socket.on('connect', function() {
      self.connecting = false;
      self.emit('connect');
      self.sendNextCommand();
    });

    self.socket.on('error', err => {
      self.connecting = false;
      self.emit('error', err);
    });

    self.socket.on('data', buf => self.bunser?.append(buf));

    self.socket.on('end', function() {
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
  let proc = null;
  let spawnFailed = false;

  function spawnError(error) {
    if (spawnFailed) return;
    spawnFailed = true;

    if (error.errno === 'EACCES') {
      error.message = 'The Watchman CLI is installed but cannot be spawned due to permissions';
    } else if (error.errno === 'ENOENT') {
      error.message = 'Watchman not found in PATH. See installation instructions';
    }
    console.error('Watchman: ', error.message);
    self.emit('error', error);
  }

  try {
    proc = childProcess.spawn(this.watchmanBinaryPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
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

  proc.on('error', error => spawnError(error));

  proc.on('close', function(code, signal) {
    if (code !== 0) {
      spawnError(new Error(
        `${self.watchmanBinaryPath} ${args.join(' ')} exited with code=${code}, signal=${signal}, stderr=${stderr.join('')}`
      ));
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

Client.prototype.command = function(args, done = () => {}) {
  this.commands.push({ cmd: args, cb: done });

  if (!this.socket && !this.connecting) {
    this.connecting = true;
    this.connect();
    return;
  }

  this.sendNextCommand();
}

const cap_versions = {
  "cmd-watch-del-all": "3.1.1",
  "cmd-watch-project": "3.1",
  "relative_root": "3.3",
  "term-dirname": "3.1",
  "term-idirname": "3.1",
  "wildmatch": "3.7",
}

function vers_compare(a, b) {
  a = a.split('.');
  b = b.split('.');
  for (let i = 0; i < 3; i++) {
    const d = parseInt(a[i] || '0') - parseInt(b[i] || '0');
    if (d !== 0) return d;
  }
  return 0;
}

function have_cap(vers, name) {
  if (name in cap_versions) {
    return vers_compare(vers, cap_versions[name]) >= 0;
  }
  return false;
}

Client.prototype._synthesizeCapabilityCheck = function(resp, optional, required) {
  resp.capabilities = {};
  const version = resp.version;
  optional.forEach(name => resp.capabilities[name] = have_cap(version, name));
  required.forEach(name => {
    const have = have_cap(version, name);
    resp.capabilities[name] = have;
    if (!have) {
      resp.error = `client required capability \`${name}\` is not supported by this server`;
    }
  });
  return resp;
}

Client.prototype.capabilityCheck = function(caps, done) {
  const optional = caps.optional || [];
  const required = caps.required || [];
  const self = this;
  
  this.command(['version', { optional, required }], function (error, resp) {
    if (error) {
      done(error);
      return;
    }
    if (!('capabilities' in resp)) {
      resp = self._synthesizeCapabilityCheck(resp, optional, required);
      if (resp.error) {
        error = new Error(resp.error);
        error.watchmanResponse = resp;
        done(error);
        return;
      }
    }
    done(null, resp);
  });
}

Client.prototype.end = function() {
  this.cancelCommands('The client was ended');
  if (this.socket) {
    this.socket.end();
    this.socket = null;
  }
  this.bunser = null;
}
