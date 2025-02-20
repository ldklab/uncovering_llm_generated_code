'use strict';

module.exports = npa;
module.exports.resolve = resolve;
module.exports.toPurl = toPurl;
module.exports.Result = Result;

const { URL } = require('url');
const HostedGit = require('hosted-git-info');
const semver = require('semver');
const path = global.FAKE_WINDOWS ? require('path').win32 : require('path');
const validatePackageName = require('validate-npm-package-name');
const { homedir } = require('os');
const { log } = require('proc-log');

const isWindows = process.platform === 'win32' || global.FAKE_WINDOWS;
const pathSeparator = isWindows ? /\\|[/]/ : /[/]/;
const urlRegEx = /^(?:git[+])?[a-z]+:/i;
const gitRegEx = /^[^@]+@[^:.]+\.[^:]+:.+$/i;
const fileRegex = /[.](?:tgz|tar.gz|tar)$/i;

function npa(arg, where) {
  let name, spec;
  
  if (typeof arg === 'object') {
    if (arg instanceof Result && (!where || where === arg.where)) {
      return arg;
    } else if (arg.name && arg.rawSpec) {
      return npa.resolve(arg.name, arg.rawSpec, where || arg.where);
    }
    return npa(arg.raw, where || arg.where);
  }
  
  const nameEndsAt = arg[0] === '@' ? arg.slice(1).indexOf('@') + 1 : arg.indexOf('@');
  const namePart = nameEndsAt > 0 ? arg.slice(0, nameEndsAt) : arg;
  
  if (urlRegEx.test(arg)) {
    spec = arg;
  } else if (gitRegEx.test(arg)) {
    spec = `git+ssh://${arg}`;
  } else if (namePart[0] !== '@' && (pathSeparator.test(namePart) || fileRegex.test(namePart))) {
    spec = arg;
  } else if (nameEndsAt > 0) {
    name = namePart;
    spec = arg.slice(nameEndsAt + 1) || '*';
  } else {
    const valid = validatePackageName(arg);
    if (valid.validForOldPackages) {
      name = arg;
      spec = '*';
    } else {
      spec = arg;
    }
  }
  
  return resolve(name, spec, where, arg);
}

const fileSpec = isWindows ? /^(?:[.]|~[/]|[/\\]|[a-zA-Z]:)/ : /^(?:[.]|~[/]|[/]|[a-zA-Z]:)/;

function resolve(name, spec, where, arg) {
  const res = new Result({ raw: arg, name, rawSpec: spec, fromArgument: arg != null });

  if (name) {
    res.setName(name);
  }

  if (spec && (fileSpec.test(spec) || /^file:/i.test(spec))) {
    return fromFile(res, where);
  } else if (spec && /^npm:/i.test(spec)) {
    return fromAlias(res, where);
  }

  const hosted = HostedGit.fromUrl(spec, { noGitPlus: true, noCommittish: true });
  if (hosted) {
    return fromHostedGit(res, hosted);
  } else if (spec && urlRegEx.test(spec)) {
    return fromURL(res);
  } else if (spec && (pathSeparator.test(spec) || fileRegex.test(spec))) {
    return fromFile(res, where);
  }
  
  return fromRegistry(res);
}

const defaultRegistry = 'https://registry.npmjs.org';

function toPurl(arg, reg = defaultRegistry) {
  const res = npa(arg);

  if (res.type !== 'version') {
    throw invalidPurlType(res.type, res.raw);
  }

  let purl = 'pkg:npm/' + res.name.replace(/^@/, '%40') + '@' + res.rawSpec;
  if (reg !== defaultRegistry) {
    purl += '?repository_url=' + reg;
  }

  return purl;
}

function invalidPackageName(name, valid, raw) {
  const err = new Error(`Invalid package name "${name}" of package "${raw}": ${valid.errors.join('; ')}.`);
  err.code = 'EINVALIDPACKAGENAME';
  return err;
}

function invalidTagName(name, raw) {
  const err = new Error(`Invalid tag name "${name}" of package "${raw}": Tags may not have any characters that encodeURIComponent encodes.`);
  err.code = 'EINVALIDTAGNAME';
  return err;
}

function invalidPurlType(type, raw) {
  const err = new Error(`Invalid type "${type}" of package "${raw}": Purl can only be generated for "version" types.`);
  err.code = 'EINVALIDPURLTYPE';
  return err;
}

function Result(opts) {
  this.type = opts.type;
  this.registry = opts.registry;
  this.where = opts.where;
  this.raw = opts.raw == null ? (opts.name ? `${opts.name}@${opts.rawSpec}` : opts.rawSpec) : opts.raw;

  this.name = undefined;
  this.escapedName = undefined;
  this.scope = undefined;
  this.rawSpec = opts.rawSpec || '';
  this.saveSpec = opts.saveSpec;
  this.fetchSpec = opts.fetchSpec;
  if (opts.name) {
    this.setName(opts.name);
  }
  this.gitRange = opts.gitRange;
  this.gitCommittish = opts.gitCommittish;
  this.gitSubdir = opts.gitSubdir;
  this.hosted = opts.hosted;
}

Result.prototype.setName = function (name) {
  const valid = validatePackageName(name);
  if (!valid.validForOldPackages) {
    throw invalidPackageName(name, valid, this.raw);
  }

  this.name = name;
  this.scope = name.startsWith('@') ? name.slice(0, name.indexOf('/')) : undefined;
  this.escapedName = name.replace('/', '%2f');
  return this;
}

Result.prototype.toString = function () {
  const full = [];
  if (this.name != null && this.name !== '') {
    full.push(this.name);
  }
  const spec = this.saveSpec || this.fetchSpec || this.rawSpec;
  if (spec != null && spec !== '') {
    full.push(spec);
  }
  return full.length ? full.join('@') : this.raw;
}

Result.prototype.toJSON = function () {
  return { ...this, hosted: undefined };
}

function setGitAttrs(res, committish) {
  if (!committish) {
    res.gitCommittish = null;
    return;
  }

  for (const part of committish.split('::')) {
    if (!part.includes(':')) {
      if (res.gitRange) {
        throw new Error('cannot override existing semver range with a committish');
      }
      if (res.gitCommittish) {
        throw new Error('cannot override existing committish with a second committish');
      }
      res.gitCommittish = part;
      continue;
    }
    const [name, value] = part.split(':');
    if (name === 'semver') {
      if (res.gitCommittish) {
        throw new Error('cannot override existing committish with a semver range');
      }
      if (res.gitRange) {
        throw new Error('cannot override existing semver range with a second semver range');
      }
      res.gitRange = decodeURIComponent(value);
      continue;
    }
    if (name === 'path') {
      if (res.gitSubdir) {
        throw new Error('cannot override existing path with a second path');
      }
      res.gitSubdir = `/${value}`;
      continue;
    }
    log.warn('npm-package-arg', `ignoring unknown key "${name}"`);
  }
}

function fromFile(res, where) {
  where = where || process.cwd();
  res.type = fileRegex.test(res.rawSpec) ? 'file' : 'directory';
  res.where = where;

  let specUrl, resolvedUrl;
  const prefix = (!/^file:/.test(res.rawSpec) ? 'file:' : '');
  const rawWithPrefix = prefix + res.rawSpec;

  try {
    resolvedUrl = new URL(rawWithPrefix, `file://${path.resolve(where)}/`);
    specUrl = new URL(rawWithPrefix);
  } catch (originalError) {
    throw new Error('Invalid file: URL, must comply with RFC 8089', { originalError, raw: res.rawSpec });
  }

  // Handle backwards compatibility for certain URL forms.
  if (resolvedUrl.host && resolvedUrl.host !== 'localhost') {
    const rawSpec = res.rawSpec.replace(/^file:\/\//, 'file:///');
    resolvedUrl = new URL(rawSpec, `file://${path.resolve(where)}/`);
    specUrl = new URL(rawSpec);
  }

  let specPath = decodeURIComponent(specUrl.pathname);
  let resolvedPath = decodeURIComponent(resolvedUrl.pathname);
  if (isWindows) {
    specPath = specPath.replace(/^\/+([a-z]:\/)/i, '$1');
    resolvedPath = resolvedPath.replace(/^\/+([a-z]:\/)/i, '$1');
  }

  if (/^\/~(\/|$)/.test(specPath)) {
    res.saveSpec = `file:${specPath.substr(1)}`;
    resolvedPath = path.resolve(homedir(), specPath.substr(3));
  } else if (!path.isAbsolute(prefix + res.rawSpec)) {
    res.saveSpec = `file:${path.relative(where, resolvedPath)}`;
  } else {
    res.saveSpec = `file:${path.resolve(resolvedPath)}`;
  }

  res.fetchSpec = path.resolve(where, resolvedPath);
  return res;
}

function fromHostedGit(res, hosted) {
  res.type = 'git';
  res.hosted = hosted;
  res.saveSpec = hosted.toString({ noGitPlus: false, noCommittish: false });
  res.fetchSpec = hosted.getDefaultRepresentation() === 'shortcut' ? null : hosted.toString();
  setGitAttrs(res, hosted.committish);
  return res;
}

function unsupportedURLType(protocol, spec) {
  const err = new Error(`Unsupported URL Type "${protocol}": ${spec}`);
  err.code = 'EUNSUPPORTEDPROTOCOL';
  return err;
}

function fromURL(res) {
  let rawSpec = res.rawSpec;
  res.saveSpec = rawSpec;
  if (rawSpec.startsWith('git+file://')) {
    rawSpec = rawSpec.replace(/\\/g, '/');
  }
  const parsedUrl = new URL(rawSpec);

  switch (parsedUrl.protocol) {
    case 'git:':
    case 'git+http:':
    case 'git+https:':
    case 'git+rsync:':
    case 'git+ftp:':
    case 'git+file:':
    case 'git+ssh:':
      res.type = 'git';
      setGitAttrs(res, parsedUrl.hash.slice(1));
      if (parsedUrl.protocol === 'git+file:' && /^git\+file:\/\/[a-z]:/i.test(rawSpec)) {
        res.fetchSpec = `git+file://${parsedUrl.host.toLowerCase()}:${parsedUrl.pathname}`;
      } else {
        parsedUrl.hash = '';
        res.fetchSpec = parsedUrl.toString().substring(4); // Remove 'git+' from the URL
      }
      break;
    case 'http:':
    case 'https:':
      res.type = 'remote';
      res.fetchSpec = res.saveSpec;
      break;
    default:
      throw unsupportedURLType(parsedUrl.protocol, rawSpec);
  }

  return res;
}

function fromAlias(res, where) {
  const subSpec = npa(res.rawSpec.substr(4), where);
  if (subSpec.type === 'alias') {
    throw new Error('nested aliases not supported');
  }

  if (!subSpec.registry) {
    throw new Error('aliases only work for registry deps');
  }

  if (!subSpec.name) {
    throw new Error('aliases must have a name');
  }

  res.subSpec = subSpec;
  res.registry = true;
  res.type = 'alias';
  res.saveSpec = null;
  res.fetchSpec = null;
  return res;
}

function fromRegistry(res) {
  res.registry = true;
  const spec = res.rawSpec.trim();
  res.saveSpec = null;
  res.fetchSpec = spec;
  const version = semver.valid(spec, true);
  const range = semver.validRange(spec, true);
  if (version) {
    res.type = 'version';
  } else if (range) {
    res.type = 'range';
  } else {
    if (encodeURIComponent(spec) !== spec) {
      throw invalidTagName(spec, res.raw);
    }
    res.type = 'tag';
  }
  return res;
}
