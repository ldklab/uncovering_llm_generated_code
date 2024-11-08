'use strict';
const url = require('url');
const gitHosts = require('./git-host-info.js');
const GitHost = require('./git-host.js');
const LRU = require('lru-cache');
const cache = new LRU({ max: 1000 });

const protocolToRepresentationMap = {
  'git+ssh:': 'sshurl',
  'git+https:': 'https',
  'ssh:': 'sshurl',
  'git:': 'git'
};

function protocolToRepresentation(protocol) {
  return protocolToRepresentationMap[protocol] || protocol.slice(0, -1);
}

const authProtocols = {
  'git:': true,
  'https:': true,
  'git+https:': true,
  'http:': true,
  'git+http:': true
};

function fromUrl(giturl, opts) {
  if (typeof giturl !== 'string') return;
  const key = giturl + JSON.stringify(opts || {});

  if (!cache.has(key)) {
    cache.set(key, parseGitHost(giturl, opts));
  }

  return cache.get(key);
}

function parseGitHost(giturl, opts) {
  if (!giturl) return;

  const url = adjustGistUrl(isGitHubShorthand(giturl) ? 'github:' + giturl : giturl);
  const parsed = parseGitUrl(url);
  const shortcutMatch = url.match(new RegExp('^([^:]+):(?:(?:[^@:]+(?:[^@]+)?@)?([^/]*))[/](.+?)(?:[.]git)?($|#)'));
  
  const matches = Object.keys(gitHosts).map(gitHostName => {
    try {
      const gitHostInfo = gitHosts[gitHostName];
      let auth = parsed.auth && authProtocols[parsed.protocol] ? parsed.auth : null;
      let committish = parsed.hash ? decodeURIComponent(parsed.hash.substr(1)) : null;
      let user = null;
      let project = null;
      let defaultRepresentation = null;

      if (shortcutMatch && shortcutMatch[1] === gitHostName) {
        user = shortcutMatch[2] && decodeURIComponent(shortcutMatch[2]);
        project = decodeURIComponent(shortcutMatch[3]);
        defaultRepresentation = 'shortcut';
      } else {
        if (!isValidHostAndProtocol(parsed, gitHostInfo)) return;
        
        const matched = parsed.path.match(gitHostInfo.pathmatch);
        if (!matched) return;
        
        user = decodeURIComponent(matched[1]?.replace(/^:/, ''));
        project = decodeURIComponent(matched[2]);
        defaultRepresentation = protocolToRepresentation(parsed.protocol);
      }
      
      return new GitHost(gitHostName, user, auth, project, committish, defaultRepresentation, opts);
      
    } catch (ex) {
      if (!(ex instanceof URIError)) throw ex;
    }
  }).filter(Boolean);

  return matches.length === 1 ? matches[0] : undefined;
}

function isGitHubShorthand(arg) {
  return /^[^:@%/\s.-][^:@%/\s]*[/][^:@\s/%]+(?:#.*)?$/.test(arg);
}

function adjustGistUrl(giturl) {
  const parsed = url.parse(giturl);
  return parsed.protocol === 'gist:' && parsed.host && !parsed.path 
    ? parsed.protocol + '/' + parsed.host 
    : giturl;
}

function parseGitUrl(giturl) {
  const sshMatched = giturl.match(/^([^@]+)@([^:/]+):[/]?((?:[^/]+[/])?[^/]+?)(?:[.]git)?(#.*)?$/);

  if (!sshMatched) {
    const legacy = url.parse(giturl);
    if (legacy.auth) repairAuthParsing(giturl, legacy);
    return legacy;
  }

  return {
    protocol: 'git+ssh:',
    slashes: true,
    auth: sshMatched[1],
    host: sshMatched[2],
    hostname: sshMatched[2],
    hash: sshMatched[4],
    pathname: '/' + sshMatched[3],
    path: '/' + sshMatched[3],
    href: `git+ssh://${sshMatched[1]}@${sshMatched[2]}/${sshMatched[3]}${sshMatched[4] || ''}`
  };
}

function isValidHostAndProtocol(parsed, gitHostInfo) {
  return parsed.host === gitHostInfo.domain || parsed.host.replace(/^www[.]/, '') === gitHostInfo.domain 
        && gitHostInfo.protocols_re.test(parsed.protocol) && parsed.path;
}

function repairAuthParsing(giturl, legacy) {
  const authMatch = giturl.match(/[^@]+@[^:/]+/);
  if (authMatch) {
    const whatwg = new url.URL(authMatch[0]);
    legacy.auth = whatwg.username || '';
    if (whatwg.password) legacy.auth += ':' + whatwg.password;
  }
}

module.exports.fromUrl = fromUrl;
