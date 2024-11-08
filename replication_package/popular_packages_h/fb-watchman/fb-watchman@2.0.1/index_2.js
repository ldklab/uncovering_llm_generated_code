'use strict';

const net = require('net');
const { EventEmitter } = require('events');
const { inherits } = require('util');
const childProcess = require('child_process');
const bser = require('bser');

const unilateralTags = ['subscription', 'log'];

function Client(options = {}) {
  EventEmitter.call(this);
  
  this.watchmanBinaryPath = options.watchmanBinaryPath ? options.watchmanBinaryPath.trim() : 'watchman';
  this.commands = [];
}
inherits(Client, EventEmitter);

Client.prototype.sendNextCommand = function() {
  if (this.currentCommand) {
    return;
  }

  this.currentCommand = this.commands.shift();
  if (this.currentCommand) {
    this.socket.write(bser.dumpToBuffer(this.currentCommand.cmd));
  }
};

Client.prototype.cancelCommands = function(reason) {
  const error = new Error(reason);
  const pendingCommands = this.commands;
  this.commands = [];

  if (this.currentCommand) {
    pendingCommands.unshift(this.currentCommand);
    this.currentCommand = null;
  }

  pendingCommands.forEach(cmd => cmd.cb(error));
};

Client.prototype.connect = function() {
  const makeSocketConnection = (socketName) => {
    this.bunser = new bser.BunserBuf();
    this.bunser.on('value', (obj) => {
      const unilateralTag = unilateralTags.find(tag => tag in obj);

      if (unilateralTag) {
        this.emit(unilateralTag, obj);
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
    });

    this.bunser.on('error', (err) => this.emit('error', err));

    this.socket = net.createConnection(socketName);
    this.socket.on('connect', () => {
      this.connecting = false;
      this.emit('connect');
      this.sendNextCommand();
    });
    this.socket.on('error', (err) => {
      this.connecting = false;
      this.emit('error', err);
    });
    this.socket.on('data', (buf) => this.bunser?.append(buf));
    this.socket.on('end', () => {
      this.socket = null;
      this.bunser = null;
      this.cancelCommands('The watchman connection was closed');
      this.emit('end');
    });
  };

  if (process.env.WATCHMAN_SOCK) {
    makeSocketConnection(process.env.WATCHMAN_SOCK);
    return;
  }

  const args = ['--no-pretty', 'get-sockname'];
  let proc = null;
  let spawnFailed = false;
  
  const handleSpawnError = (error) => {
    if (spawnFailed) return;
    spawnFailed = true;
    switch (error.errno) {
      case 'EACCES':
        error.message = 'The Watchman CLI cannot be spawned due to permission issues';
        break;
      case 'ENOENT':
        error.message = 'Watchman not found in PATH. Install it by following: https://facebook.github.io/watchman/docs/install.html';
        break;
    }
    console.error('Watchman: ', error.message);
    this.emit('error', error);
  };

  try {
    proc = childProcess.spawn(this.watchmanBinaryPath, args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch (error) {
    handleSpawnError(error);
    return;
  }

  const stdout = [];
  const stderr = [];
  proc.stdout.on('data', (data) => stdout.push(data));
  proc.stderr.on('data', (data) => {
    const msg = data.toString('utf8');
    stderr.push(msg);
    console.error(msg);
  });
  proc.on('error', handleSpawnError);

  proc.on('close', (code, signal) => {
    if (code !== 0) {
      handleSpawnError(new Error(`${this.watchmanBinaryPath} failed with exit code=${code}, signal=${signal}, stderr=${stderr.join('')}`));
      return;
    }
    
    try {
      const obj = JSON.parse(stdout.join(''));
      if ('error' in obj) {
        const error = new Error(obj.error);
        error.watchmanResponse = obj;
        this.emit('error', error);
      } else {
        makeSocketConnection(obj.sockname);
      }
    } catch (e) {
      this.emit('error', e);
    }
  });
};

Client.prototype.command = function(args, done = () => {}) {
  this.commands.push({ cmd: args, cb: done });
  
  if (!this.socket) {
    if (!this.connecting) {
      this.connecting = true;
      this.connect();
    }
    return;
  }
  
  this.sendNextCommand();
};

const capabilityVersions = {
  "cmd-watch-del-all": "3.1.1",
  "cmd-watch-project": "3.1",
  "relative_root": "3.3",
  "term-dirname": "3.1",
  "term-idirname": "3.1",
  "wildmatch": "3.7",
};

function compareVersions(a, b) {
  const aVersion = a.split('.').map(Number);
  const bVersion = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (aVersion[i] || 0) - (bVersion[i] || 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

function hasCapability(version, name) {
  return name in capabilityVersions && compareVersions(version, capabilityVersions[name]) >= 0;
}

Client.prototype._synthesizeCapabilityCheck = function(resp, optional, required) {
  resp.capabilities = {};
  const version = resp.version;

  optional.forEach(name => {
    resp.capabilities[name] = hasCapability(version, name);
  });
  required.forEach(name => {
    const hasCap = hasCapability(version, name);
    resp.capabilities[name] = hasCap;
    if (!hasCap) {
      resp.error = `Client required capability '${name}' is not supported by this server`;
    }
  });

  return resp;
};

Client.prototype.capabilityCheck = function(caps, done) {
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
};

Client.prototype.end = function() {
  this.cancelCommands('The client was ended');
  this.socket?.end();
  this.socket = null;
  this.bunser = null;
};

module.exports.Client = Client;
