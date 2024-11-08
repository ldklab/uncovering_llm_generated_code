'use strict';

const { URL } = require('url');
const HostedGit = require('hosted-git-info');
const semver = require('semver');
const path = global.FAKE_WINDOWS ? require('path').win32 : require('path');
const validatePackageName = require('validate-npm-package-name');
const { homedir } = require('os');
const { log } = require('proc-log');

// Exported module functions
module.exports = npa;
module.exports.resolve = resolve;
module.exports.toPurl = toPurl;
module.exports.Result = Result;

// Platform specific settings
const isWindows = process.platform === 'win32' || global.FAKE_WINDOWS;
const hasSlashes = isWindows ? /\\|[/]/ : /[/]/;
const isURL = /^(?:git[+])?[a-z]+:/i;
const isGit = /^[^@]+@[^:.]+\.[^:]+:.+$/i;
const isFilename = /[.](?:tgz|tar.gz|tar)$/i;

// Main function to parse package arguments
function npa(arg, where) {
  let name, spec;
  if (typeof arg === 'object') {
    if (arg instanceof Result && (!where || where === arg.where)) {
      return arg;
    } else if (arg.name && arg.rawSpec) {
      return npa.resolve(arg.name, arg.rawSpec, where || arg.where);
    } else {
      return npa(arg.raw, where || arg.where);
    }
  }
  const nameEndsAt = arg[0] === '@' ? arg.slice(1).indexOf('@') + 1 : arg.indexOf('@');
  const namePart = nameEndsAt > 0 ? arg.slice(0, nameEndsAt) : arg;

  if (isURL.test(arg)) {
    spec = arg;
  } else if (isGit.test(arg)) {
    spec = `git+ssh://${arg}`;
  } else if (namePart[0] !== '@' && (hasSlashes.test(namePart) || isFilename.test(namePart))) {
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

// Determine the type of dependency specification
function resolve(name, spec, where, arg) {
  const res = new Result({
    raw: arg,
    name: name,
    rawSpec: spec,
    fromArgument: arg != null,
  });

  if (name) {
    res.setName(name);
  }

  if (spec && (isFilespec.test(spec) || /^file:/i.test(spec))) {
    return fromFile(res, where);
  } else if (spec && /^npm:/i.test(spec)) {
    return fromAlias(res, where);
  }

  const hosted = HostedGit.fromUrl(spec, {
    noGitPlus: true,
    noCommittish: true,
  });
  if (hosted) {
    return fromHostedGit(res, hosted);
  } else if (spec && isURL.test(spec)) {
    return fromURL(res);
  } else if (spec && (hasSlashes.test(spec) || isFilename.test(spec))) {
    return fromFile(res, where);
  } else {
    return fromRegistry(res);
  }
}

// Resolve specific sources: file, hosted git, url, registry alias
function fromFile(res, where) {
  if (!where) {
    where = process.cwd();
  }
  res.type = isFilename.test(res.rawSpec) ? 'file' : 'directory';
  res.where = where;

  let specUrl, resolvedUrl;
  const prefix = !/^file:/.test(res.rawSpec) ? 'file:' : '';
  const rawWithPrefix = prefix + res.rawSpec;
  let rawNoPrefix = rawWithPrefix.replace(/^file:/, '');

  try {
    resolvedUrl = new URL(rawWithPrefix, `file://${path.resolve(where)}/`);
    specUrl = new URL(rawWithPrefix);
  } catch (originalError) {
    const er = new Error('Invalid file: URL, must comply with RFC 8089');
    throw Object.assign(er, {
      raw: res.rawSpec,
      spec: res,
      where,
      originalError,
    });
  }

  if (resolvedUrl.host && resolvedUrl.host !== 'localhost') {
    const rawSpec = res.rawSpec.replace(/^file:\/\//, 'file:///');
    resolvedUrl = new URL(rawSpec, `file://${path.resolve(where)}/`);
    specUrl = new URL(rawSpec);
    rawNoPrefix = rawSpec.replace(/^file:/, '');
  }

  if (/^\/{1,3}\.\.?(\/|$)/.test(rawNoPrefix)) {
    const rawSpec = res.rawSpec.replace(/^file:\/{1,3}/, 'file:');
    resolvedUrl = new URL(rawSpec, `file://${path.resolve(where)}/`);
    specUrl = new URL(rawSpec);
    rawNoPrefix = rawSpec.replace(/^file:/, '');
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
  } else if (!path.isAbsolute(rawNoPrefix)) {
    res.saveSpec = `file:${path.relative(where, resolvedPath)}`;
  } else {
    res.saveSpec = `file:${path.resolve(resolvedPath)}`;
  }

  res.fetchSpec = path.resolve(where, resolvedPath);
  return res;
}

// Translate package to its package URL (PURL)
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

// Class Result to store package details
function Result(opts) {
  this.type = opts.type;
  this.registry = opts.registry;
  this.where = opts.where;
  this.raw = opts.raw || (opts.name ? opts.name + '@' + opts.rawSpec : opts.rawSpec);
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

// Set package name with validation
Result.prototype.setName = function(name) {
  const valid = validatePackageName(name);
  if (!valid.validForOldPackages) {
    throw invalidPackageName(name, valid, this.raw);
  }

  this.name = name;
  this.scope = name[0] === '@' ? name.slice(0, name.indexOf('/')) : undefined;
  this.escapedName = name.replace('/', '%2f');
  return this;
};

// Convert Result to string form
Result.prototype.toString = function() {
  const full = [];
  if (this.name != null && this.name !== '') {
    full.push(this.name);
  }
  const spec = this.saveSpec || this.fetchSpec || this.rawSpec;
  if (spec != null && spec !== '') {
    full.push(spec);
  }
  return full.length ? full.join('@') : this.raw;
};

// Convert Result to JSON form
Result.prototype.toJSON = function() {
  const result = Object.assign({}, this);
  delete result.hosted;
  return result;
};

// Set Git attributes for Git dependencies
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

// Process URL to extract info; handles different URL types
function fromURL(res) {
  let rawSpec = res.rawSpec;
  res.saveSpec = rawSpec;
  if (rawSpec.startsWith('git+ssh:')) {
    const matched = rawSpec.match(/^git\+ssh:\/\/([^:#]+:[^#]+(?:\.git)?)(?:#(.*))?$/i);
    if (matched && !matched[1].match(/:[0-9]+\/?.*$/i)) {
      res.type = 'git';
      setGitAttrs(res, matched[2]);
      res.fetchSpec = matched[1];
      return res;
    }
  } else if (rawSpec.startsWith('git+file://')) {
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
        res.fetchSpec = parsedUrl.toString();
      }
      if (res.fetchSpec.startsWith('git+')) {
        res.fetchSpec = res.fetchSpec.slice(4);
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

// Handle aliases to other packages
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

// Handle registry-based package dependencies
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

const defaultRegistry = 'https://registry.npmjs.org';

// Error handling function
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

function unsupportedURLType(protocol, spec) {
  const err = new Error(`Unsupported URL Type "${protocol}": ${spec}`);
  err.code = 'EUNSUPPORTEDPROTOCOL';
  return err;
}

const isFilespec = isWindows ? /^(?:[.]|~[/]|[/\\]|[a-zA-Z]:)/ : /^(?:[.]|~[/]|[/]|[a-zA-Z]:)/;

// Hosted Git operations
function fromHostedGit(res, hosted) {
  res.type = 'git';
  res.hosted = hosted;
  res.saveSpec = hosted.toString({ noGitPlus: false, noCommittish: false });
  res.fetchSpec = hosted.getDefaultRepresentation() === 'shortcut' ? null : hosted.toString();
  setGitAttrs(res, hosted.committish);
  return res;
}
