'use strict';
const fs = require('fs');
const path = require('path');

const LCHOWN = fs.lchown ? 'lchown' : 'chown';
const LCHOWNSYNC = fs.lchownSync ? 'lchownSync' : 'chownSync';

const needEISDIRHandled = fs.lchown &&
  !process.version.match(/v1[1-9]+\./) &&
  !process.version.match(/v10\.[6-9]/);

const lchownSync = (path, uid, gid) => {
  try {
    return fs[LCHOWNSYNC](path, uid, gid);
  } catch (er) {
    if (er.code !== 'ENOENT') throw er;
  }
};

const chownSync = (path, uid, gid) => {
  try {
    return fs.chownSync(path, uid, gid);
  } catch (er) {
    if (er.code !== 'ENOENT') throw er;
  }
};

const handleEISDIR = needEISDIRHandled
  ? (path, uid, gid, cb) => er => {
      if (!er || er.code !== 'EISDIR') cb(er);
      else fs.chown(path, uid, gid, cb);
    }
  : (_, __, ___, cb) => cb;

const handleEISDirSync = needEISDIRHandled
  ? (path, uid, gid) => {
      try {
        return lchownSync(path, uid, gid);
      } catch (er) {
        if (er.code !== 'EISDIR') throw er;
        chownSync(path, uid, gid);
      }
    }
  : (path, uid, gid) => lchownSync(path, uid, gid);

const nodeVersion = process.version;
let readdir = fs.readdir.bind(fs);
let readdirSync = fs.readdirSync.bind(fs);
if (/^v4\./.test(nodeVersion)) {
  readdir = (path, options, cb) => fs.readdir(path, cb);
}

const chown = (cpath, uid, gid, cb) => {
  fs[LCHOWN](cpath, uid, gid, handleEISDIR(cpath, uid, gid, er => {
    cb(er && er.code !== 'ENOENT' ? er : null);
  }));
};

const chownrKid = (p, child, uid, gid, cb) => {
  if (typeof child === 'string') {
    return fs.lstat(path.resolve(p, child), (er, stats) => {
      if (er) return cb(er.code !== 'ENOENT' ? er : null);
      stats.name = child;
      chownrKid(p, stats, uid, gid, cb);
    });
  }

  if (child.isDirectory()) {
    chownr(path.resolve(p, child.name), uid, gid, er => {
      if (er) return cb(er);
      chown(path.resolve(p, child.name), uid, gid, cb);
    });
  } else {
    chown(path.resolve(p, child.name), uid, gid, cb);
  }
};

const chownr = (p, uid, gid, cb) => {
  readdir(p, { withFileTypes: true }, (er, children) => {
    if (er) {
      if (er.code === 'ENOENT') return cb();
      else if (er.code !== 'ENOTDIR' && er.code !== 'ENOTSUP') return cb(er);
    }
    if (er || !children.length) return chown(p, uid, gid, cb);

    let len = children.length;
    let errState = null;
    const then = er => {
      if (errState) return;
      if (er) return cb(errState = er);
      if (--len === 0) return chown(p, uid, gid, cb);
    };

    children.forEach(child => chownrKid(p, child, uid, gid, then));
  });
};

const chownrKidSync = (p, child, uid, gid) => {
  if (typeof child === 'string') {
    try {
      const stats = fs.lstatSync(path.resolve(p, child));
      stats.name = child;
      child = stats;
    } catch (er) {
      if (er.code === 'ENOENT') return;
      else throw er;
    }
  }

  if (child.isDirectory()) chownrSync(path.resolve(p, child.name), uid, gid);
  handleEISDirSync(path.resolve(p, child.name), uid, gid);
};

const chownrSync = (p, uid, gid) => {
  let children;
  try {
    children = readdirSync(p, { withFileTypes: true });
  } catch (er) {
    if (er.code === 'ENOENT') return;
    else if (er.code === 'ENOTDIR' || er.code === 'ENOTSUP')
      return handleEISDirSync(p, uid, gid);
    else throw er;
  }

  if (children && children.length)
    children.forEach(child => chownrKidSync(p, child, uid, gid));

  return handleEISDirSync(p, uid, gid);
};

module.exports = chownr;
chownr.sync = chownrSync;
