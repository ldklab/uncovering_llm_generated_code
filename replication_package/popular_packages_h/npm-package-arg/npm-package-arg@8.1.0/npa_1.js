'use strict';

module.exports = npa;
module.exports.resolve = resolve;
module.exports.Result = Result;

const validatePackageName = require('validate-npm-package-name');
const HostedGit = require('hosted-git-info');
const semver = require('semver');
const path = require('path');
const url = require('url');
const os = require('os');

const isWindows = process.platform === 'win32' || global.FAKE_WINDOWS;
const hasSlashes = isWindows ? /\\|[/]/ : /[/]/;
const isURL = /^(?:git[+])?[a-z]+:/i;
const isFilename = /[.](?:tgz|tar.gz|tar)$/i;
const isFilespec = isWindows ? /^(?:[.]|~[/]|[/\\]|[a-zA-Z]:)/ : /^(?:[.]|~[/]|[/]|[a-zA-Z]:)/;
const isAbsolutePath = /^[/]|^[A-Za-z]:/;

function npa(arg, where) {
  if (typeof arg === 'object') {
    if (arg instanceof Result && (!where || where === arg.where)) return arg;
    if (arg.name && arg.rawSpec) return npa.resolve(arg.name, arg.rawSpec, where || arg.where);
    return npa(arg.raw, where || arg.where);
  }
  let name;
  let spec;
  const nameEndsAt = arg[0] === '@' ? arg.slice(1).indexOf('@') + 1 : arg.indexOf('@');
  const namePart = nameEndsAt > 0 ? arg.slice(0, nameEndsAt) : arg;

  if (isURL.test(arg)) {
    spec = arg;
  } else if (namePart[0] !== '@' && (hasSlashes.test(namePart) || isFilename.test(namePart))) {
    spec = arg;
  } else if (nameEndsAt > 0) {
    name = namePart;
    spec = arg.slice(nameEndsAt + 1);
  } else {
    const valid = validatePackageName(arg);
    name = valid.validForOldPackages ? arg : undefined;
    spec = valid.validForOldPackages ? undefined : arg;
  }

  return resolve(name, spec, where, arg);
}

function resolve(name, spec, where, arg) {
  const res = new Result({ raw: arg, name, rawSpec: spec, fromArgument: arg != null });
  if (name) res.setName(name);

  if (spec && (isFilespec.test(spec) || /^file:/i.test(spec))) {
    return fromFile(res, where);
  }
  if (spec && /^npm:/i.test(spec)) {
    return fromAlias(res, where);
  }

  const hosted = HostedGit.fromUrl(spec, { noGitPlus: true, noCommittish: true });
  if (hosted) return fromHostedGit(res, hosted);
  if (spec && isURL.test(spec)) return fromURL(res);
  if (spec && (hasSlashes.test(spec) || isFilename.test(spec))) return fromFile(res, where);
  return fromRegistry(res);
}

class Result {
  constructor(opts) {
    this.type = opts.type;
    this.registry = opts.registry;
    this.where = opts.where;
    this.raw = opts.raw == null ? `${opts.name || ''}@${opts.rawSpec || ''}` : opts.raw;
    this.rawSpec = opts.rawSpec == null ? '' : opts.rawSpec;

    if (opts.name) this.setName(opts.name);
  }

  setName(name) {
    const valid = validatePackageName(name);
    if (!valid.validForOldPackages) {
      throw invalidPackageName(name, valid);
    }
    this.name = name;
    this.scope = name[0] === '@' ? name.slice(0, name.indexOf('/')) : undefined;
    this.escapedName = name.replace('/', '%2f');
    return this;
  }

  toString() {
    const full = [];
    if (this.name) full.push(this.name);
    const spec = this.saveSpec || this.fetchSpec || this.rawSpec;
    if (spec) full.push(spec);
    return full.length ? full.join('@') : this.raw;
  }

  toJSON() {
    const result = { ...this };
    delete result.hosted;
    return result;
  }
}

function fromFile(res, where = process.cwd()) {
  res.type = isFilename.test(res.rawSpec) ? 'file' : 'directory';
  res.where = where;

  const spec = res.rawSpec
    .replace(/\\/g, '/')
    .replace(/^file:[/]*([A-Za-z]:)/, '$1')
    .replace(/^file:(?:[/]*([~./]))?/, '$1');
  
  if (/^~[/]/.test(spec)) {
    res.fetchSpec = resolvePath(os.homedir(), spec.slice(2));
    res.saveSpec = `file:${spec}`;
  } else {
    res.fetchSpec = resolvePath(where, spec);
    res.saveSpec = isAbsolute(spec) ? `file:${spec}` : `file:${path.relative(where, res.fetchSpec)}`;
  }
  return res;
}

function fromHostedGit(res, hosted) {
  res.type = 'git';
  res.hosted = hosted;
  res.saveSpec = hosted.toString({ noGitPlus: false, noCommittish: false });
  res.fetchSpec = hosted.getDefaultRepresentation() === 'shortcut' ? null : hosted.toString();
  return setGitCommittish(res, hosted.committish);
}

function fromURL(res) {
  const urlparse = url.parse(res.rawSpec);
  res.saveSpec = res.rawSpec;

  switch (urlparse.protocol) {
    case 'git:':
    case 'git+http:':
    case 'git+https:':
    case 'git+rsync:':
    case 'git+ftp:':
    case 'git+file:':
    case 'git+ssh:':
      res.type = 'git';
      const match = urlparse.protocol === 'git+ssh:' && matchGitScp(res.rawSpec);
      if (match) {
        setGitCommittish(res, match.gitCommittish);
        res.fetchSpec = match.fetchSpec;
      } else {
        setGitCommittish(res, urlparse.hash != null ? urlparse.hash.slice(1) : '');
        urlparse.protocol = urlparse.protocol.replace(/^git[+]/, '');
        if (urlparse.protocol === 'file:' && /^git\+file:\/\/[a-z]:/i.test(res.rawSpec)) {
          urlparse.host += ':';
          urlparse.hostname += ':';
        }
        delete urlparse.hash;
        res.fetchSpec = url.format(urlparse);
      }
      break;

    case 'http:':
    case 'https:':
      res.type = 'remote';
      res.fetchSpec = res.saveSpec;
      break;

    default:
      throw unsupportedURLType(urlparse.protocol, res.rawSpec);
  }

  return res;
}

function fromAlias(res, where) {
  const subSpec = npa(res.rawSpec.substr(4), where);
  if (subSpec.type === 'alias') throw new Error('nested aliases not supported');
  if (!subSpec.registry) throw new Error('aliases only work for registry deps');
  
  res.subSpec = subSpec;
  res.registry = true;
  res.type = 'alias';
  res.saveSpec = null;
  res.fetchSpec = null;
  return res;
}

function fromRegistry(res) {
  res.registry = true;
  const spec = res.rawSpec === '' ? 'latest' : res.rawSpec;
  res.saveSpec = null;
  res.fetchSpec = spec;

  const version = semver.valid(spec, true);
  const range = semver.validRange(spec, true);
  if (version) {
    res.type = 'version';
  } else if (range) {
    res.type = 'range';
  } else {
    if (encodeURIComponent(spec) !== spec) throw invalidTagName(spec);
    res.type = 'tag';
  }
  return res;
}

function setGitCommittish(res, committish) {
  if (committish != null && committish.startsWith('semver:')) {
    res.gitRange = decodeURIComponent(committish.slice(7));
    res.gitCommittish = null;
  } else {
    res.gitCommittish = committish === '' ? null : committish;
  }
  return res;
}

function resolvePath(where, spec) {
  return isAbsolutePath.test(spec) ? spec : path.resolve(where, spec);
}

function isAbsolute(dir) {
  return dir.startsWith('/') || /^[A-Za-z]:/.test(dir);
}

function matchGitScp(spec) {
  const matched = spec.match(/^git\+ssh:\/\/([^:#]+:[^#]+(?:\.git)?)(?:#(.*))?$/i);
  return matched && !matched[1].match(/:[0-9]+\/?.*$/i) && {
    fetchSpec: matched[1],
    gitCommittish: matched[2] == null ? null : matched[2],
  };
}

function unsupportedURLType(protocol, spec) {
  const err = new Error(`Unsupported URL Type "${protocol}": ${spec}`);
  err.code = 'EUNSUPPORTEDPROTOCOL';
  return err;
}

function invalidPackageName(name, valid) {
  const err = new Error(`Invalid package name "${name}": ${valid.errors.join('; ')}`);
  err.code = 'EINVALIDPACKAGENAME';
  return err;
}

function invalidTagName(name) {
  const err = new Error(`Invalid tag name "${name}": Tags may not have any characters that encodeURIComponent encodes.`);
  err.code = 'EINVALIDTAGNAME';
  return err;
}
