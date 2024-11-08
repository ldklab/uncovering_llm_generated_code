'use strict';

module.exports = npa;
module.exports.resolve = resolve;
module.exports.toPurl = toPurl;

const url = require('url');
const process = require('process');

function npa(arg, where) {
  if (!arg) throw new Error('Invalid package argument');
  return parse(arg, where || process.cwd());
}

function resolve(name, spec, where) {
  if (!name || !spec) throw new Error('Invalid name or spec');
  const arg = `${name}@${spec}`;
  return parse(arg, where || process.cwd());
}

function toPurl(arg, reg = 'https://registry.npmjs.org') {
  const parsed = parse(arg);
  if (!parsed.name || !parsed.version) throw new Error('Unable to resolve purl');
  return `pkg:npm/${parsed.name}@${parsed.version}`;
}

function parse(arg, where) {
  const result = initializeResult(arg);

  const patterns = {
    git: /^git(\+.*):\/\/(.*)/,
    file: /(file:)?(.+\.(tar\.gz|tgz|tar))$/,
    directory: /^\.\.?\//
  };

  if (patterns.git.test(arg)) {
    assignFetchSpec(result, 'git', arg.match(patterns.git)[0]);
  } else if (patterns.file.test(arg)) {
    assignFetchSpec(result, 'file', where + '/' + arg.match(patterns.file)[2]);
  } else if (patterns.directory.test(arg)) {
    assignFetchSpec(result, 'directory', where + '/' + arg);
  } else {
    processSimpleRef(result, arg);
  }

  return result;
}

function initializeResult(arg) {
  return {
    raw: arg,
    type: null,
    registry: true,
    name: null,
    scope: null,
    rawSpec: null,
    saveSpec: null,
    fetchSpec: null,
    gitRange: null,
    gitCommittish: null,
    hosted: null
  };
}

function assignFetchSpec(result, type, fetchSpec) {
  result.type = type;
  result.fetchSpec = fetchSpec;
}

function processSimpleRef(result, arg) {
  if (arg.includes('@')) {
    let [name, version] = arg.split('@');
    if (name.startsWith('@')) {
      [result.scope, name] = name.split('/');
      result.scope = '@' + result.scope;
    }
    setVersionInfo(result, name, version);
  } else {
    setTagInfo(result, arg);
  }
}

function setVersionInfo(result, name, version) {
  result.type = version ? 'version' : 'range';
  result.name = name;
  result.rawSpec = result.saveSpec = result.fetchSpec = version || 'latest';
}

function setTagInfo(result, name) {
  result.type = 'tag';
  result.name = name;
  result.rawSpec = result.saveSpec = result.fetchSpec = 'latest';
}

function escapeName(name) {
  return name ? name.replace('/', '%2f') : null;
}
