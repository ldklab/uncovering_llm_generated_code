'use strict';
const fs = require('fs');
const path = require('path');

const LCHOWN = fs.lchown ? 'lchown' : 'chown';
const LCHOWNSYNC = fs.lchownSync ? 'lchownSync' : 'chownSync';

const needEISDIRHandled = fs.lchown &&
  !process.version.match(/v1[1-9]+\./) &&
  !process.version.match(/v10\.[6-9]/);

const lchownSync = (p, uid, gid) => {
  try {
    fs[LCHOWNSYNC](p, uid, gid);
  } catch (er) {
    if (er.code !== 'ENOENT') throw er;
  }
};

const chownSync = (p, uid, gid) => {
  try {
    fs.chownSync(p, uid, gid);
  } catch (er) {
    if (er.code !== 'ENOENT') throw er;
  }
};

const handleEISDIR = needEISDIRHandled ? (p, uid, gid, cb) => er => {
  if (!er || er.code !== 'EISDIR') cb(er);
  else fs.chown(p, uid, gid, cb);
} : (_, __, ___, cb) => cb();

const handleEISDirSync = needEISDIRHandled ? (p, uid, gid) => {
  try {
    lchownSync(p, uid, gid);
  } catch (er) {
    if (er.code !== 'EISDIR') throw er;
    chownSync(p, uid, gid);
  }
} : (p, uid, gid) => lchownSync(p, uid, gid);

const readdir = fs.readdir.length > 2 ? fs.readdir : (p, _, cb) => fs.readdir(p, cb);
const readdirSync = fs.readdirSync;

const chown = (cpath, uid, gid, cb) => {
  fs[LCHOWN](cpath, uid, gid, handleEISDIR(cpath, uid, gid, er => {
    cb(er && er.code !== 'ENOENT' ? er : null);
  }));
};

const chownrKid = (p, child, uid, gid, cb) => {
  if (typeof child === 'string') {
    fs.lstat(path.resolve(p, child), (er, stats) => {
      if (er) return cb(er.code !== 'ENOENT' ? er : null);
      stats.name = child;
      chownrKid(p, stats, uid, gid, cb);
    });
  } else if (child.isDirectory()) {
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
    if (er && er.code !== 'ENOENT' && er.code !== 'ENOTDIR' && er.code !== 'ENOTSUP') return cb(er);
    if (er || !children.length) return chown(p, uid, gid, cb);

    let len = children.length;
    let errState = null;
    const done = er => {
      if (errState) return;
      if (er) return cb(errState = er);
      if (--len === 0) chown(p, uid, gid, cb);
    };

    children.forEach(child => chownrKid(p, child, uid, gid, done));
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
      throw er;
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
    if (er.code === 'ENOTDIR' || er.code === 'ENOTSUP') return handleEISDirSync(p, uid, gid);
    throw er;
  }

  if (children && children.length) {
    children.forEach(child => chownrKidSync(p, child, uid, gid));
  }

  handleEISDirSync(p, uid, gid);
};

module.exports = chownr;
chownr.sync = chownrSync;
