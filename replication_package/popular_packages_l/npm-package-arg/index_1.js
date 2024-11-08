'use strict';

module.exports = {
  npa,
  resolve,
  toPurl
};

const url = require('url');
const process = require('process');

function npa(arg, where) {
  validateArg(arg);
  return parse(arg, where || process.cwd());
}

function resolve(name, spec, where) {
  validateResolveInputs(name, spec);
  const arg = `${name}@${spec}`;
  return parse(arg, where || process.cwd());
}

function toPurl(arg, reg = 'https://registry.npmjs.org') {
  const parsed = parse(arg);
  if (!parsed.name || !parsed.version) throw new Error('Unable to resolve purl');
  
  return `pkg:npm/${parsed.name}@${parsed.version}`;
}

function parse(arg, where) {
  const result = initializeResultObject(arg);
  const patterns = definePatterns();

  if (patterns.git.test(arg)) {
    setGitFetchSpec(result, patterns.git, arg);
  } else if (patterns.file.test(arg)) {
    setFileFetchSpec(result, patterns.file, arg, where);
  } else if (patterns.dir.test(arg)) {
    setDirectoryFetchSpec(result, arg, where);
  } else {
    parseArgumentWithAtSymbol(result, arg);
  }

  result.escapedName = escapeName(result.name);
  return result;
}

function escapeName(name) {
  return name ? name.replace('/', '%2f') : null;
}

function validateArg(arg) {
  if (!arg) throw new Error('Invalid package argument');
}

function validateResolveInputs(name, spec) {
  if (!name || !spec) throw new Error('Invalid name or spec');
}

function initializeResultObject(arg) {
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

function definePatterns() {
  return {
    git: /^git(\+.*):\/\/(.*)/,
    file: /(file:)?(.+\.(tar\.gz|tgz|tar))$/,
    dir: /^\.\.?\//
  };
}

function setGitFetchSpec(result, gitPattern, arg) {
  result.type = 'git';
  result.fetchSpec = arg.match(gitPattern)[0];
}

function setFileFetchSpec(result, filePattern, arg, where) {
  result.type = 'file';
  result.fetchSpec = `${where}/${arg.match(filePattern)[2]}`;
}

function setDirectoryFetchSpec(result, arg, where) {
  result.type = 'directory';
  result.fetchSpec = `${where}/${arg}`;
}

function parseArgumentWithAtSymbol(result, arg) {
  if (arg.includes('@')) {
    let [name, version] = arg.split('@');
    if (name.startsWith('@')) {
      [result.scope, name] = name.split('/');
      result.scope = `@${result.scope}`;
    }
    assignVersionType(result, name, version);
  } else {
    setResultToTagType(result, arg);
  }
}

function assignVersionType(result, name, version) {
  result.type = version ? 'version' : 'range';
  result.name = name;
  setVersionSpecs(result, version || 'latest');
}

function setResultToTagType(result, arg) {
  result.type = 'tag';
  result.name = arg;
  setVersionSpecs(result, 'latest');
}

function setVersionSpecs(result, version) {
  result.rawSpec = result.saveSpec = result.fetchSpec = version;
}
