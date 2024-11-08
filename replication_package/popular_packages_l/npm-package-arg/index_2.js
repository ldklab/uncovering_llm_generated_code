'use strict';

module.exports = { npa, resolve, toPurl };

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
  const parseResult = {
    raw: arg, type: null, registry: true, name: null, scope: null,
    rawSpec: null, saveSpec: null, fetchSpec: null, gitRange: null,
    gitCommittish: null, hosted: null
  };

  const gitPattern = /^git(\+.*):\/\/(.*)/;
  const filePattern = /(file:)?(.+\.(tar\.gz|tgz|tar))$/;
  const directoryPattern = /^\.\.?\//;

  if (gitPattern.test(arg)) {
    parseResult.type = 'git';
    parseResult.fetchSpec = arg.match(gitPattern)[0];
  } else if (filePattern.test(arg)) {
    parseResult.type = 'file';
    parseResult.fetchSpec = `${where}/${arg.match(filePattern)[2]}`;
  } else if (directoryPattern.test(arg)) {
    parseResult.type = 'directory';
    parseResult.fetchSpec = `${where}/${arg}`;
  } else if (arg.includes('@')) {
    let [name, version] = arg.split('@');
    if (name.startsWith('@')) {
      [parseResult.scope, name] = name.split('/');
      parseResult.scope = `@${parseResult.scope}`;
    }
    parseResult.type = version ? 'version' : 'range';
    parseResult.name = name;
    parseResult.rawSpec = parseResult.saveSpec = parseResult.fetchSpec = version || 'latest';
  } else {
    parseResult.type = 'tag';
    parseResult.name = arg;
    parseResult.rawSpec = parseResult.saveSpec = parseResult.fetchSpec = 'latest';
  }

  parseResult.escapedName = escapeName(parseResult.name);
  return parseResult;
}

function escapeName(name) {
  return name ? name.replace('/', '%2f') : null;
}
