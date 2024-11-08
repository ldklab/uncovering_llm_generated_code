'use strict';

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
  let result = {
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

  const gitPattern = /^git(\+.*):\/\/(.*)/;
  const filePattern = /(file:)?(.+\.(tar\.gz|tgz|tar))$/;
  const directoryPattern = /^\.\.?\//;

  if (gitPattern.test(arg)) {
    result.type = 'git';
    result.fetchSpec = arg.match(gitPattern)[0];
  } else if (filePattern.test(arg)) {
    result.type = 'file';
    result.fetchSpec = where + '/' + arg.match(filePattern)[2];
  } else if (directoryPattern.test(arg)) {
    result.type = 'directory';
    result.fetchSpec = where + '/' + arg;
  } else if (arg.includes('@')) {
    let [name, version] = arg.split('@');
    if (name.startsWith('@')) {
      [result.scope, name] = name.split('/');
      result.scope = '@' + result.scope;
    }
    result.type = version ? 'version' : 'range';
    result.name = name;
    result.rawSpec = result.saveSpec = result.fetchSpec = version || 'latest';
  } else {
    result.type = 'tag';
    result.name = arg;
    result.rawSpec = result.saveSpec = result.fetchSpec = 'latest';
  }

  result.escapedName = escapeName(result.name);
  return result;
}

function escapeName(name) {
  return name ? name.replace('/', '%2f') : null;
}

module.exports = npa;
module.exports.resolve = resolve;
module.exports.toPurl = toPurl;
