'use strict';
const { URL } = require('url');
const gitHosts = require('./git-host-info.js');
const GitHost = module.exports = require('./git-host.js');
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

const authProtocols = new Set(['git:', 'https:', 'git+https:', 'http:', 'git+http:']);

module.exports.fromUrl = function(giturl, opts) {
  if (typeof giturl !== 'string') return;
  const key = giturl + JSON.stringify(opts || {});

  if (!cache.has(key)) {
    cache.set(key, fromUrl(giturl, opts));
  }

  return cache.get(key);
};

function fromUrl(giturl, opts) {
  if (!giturl) return;
  const fixedUrl = fixupUnqualifiedGist(isGitHubShorthand(giturl) ? 'github:' + giturl : giturl);
  const parsed = parseGitUrl(fixedUrl);

  const shortcutPattern = /^([^:]+):(?:(?:[^@:]+(?:[^@]+)?@)?([^/]*))[/](.+?)(?:[.]git)?($|#)/;
  const shortcutMatch = fixedUrl.match(shortcutPattern);

  const matches = Object.keys(gitHosts).map(gitHostName => {
    try {
      const gitHostInfo = gitHosts[gitHostName];
      let auth = null;
      if (parsed.auth && authProtocols.has(parsed.protocol)) {
        auth = parsed.auth;
      }

      const committish = parsed.hash ? decodeURIComponent(parsed.hash.substr(1)) : null;
      let user = null;
      let project = null;
      let defaultRepresentation = null;

      if (shortcutMatch && shortcutMatch[1] === gitHostName) {
        user = shortcutMatch[2] ? decodeURIComponent(shortcutMatch[2]) : null;
        project = decodeURIComponent(shortcutMatch[3]);
        defaultRepresentation = 'shortcut';
      } else {
        if (parsed.host && parsed.host !== gitHostInfo.domain && parsed.host.replace(/^www[.]/, '') !== gitHostInfo.domain) return;
        if (!gitHostInfo.protocols_re.test(parsed.protocol)) return;
        if (!parsed.path) return;

        const pathmatch = gitHostInfo.pathmatch;
        const pathMatched = parsed.path.match(pathmatch);
        if (!pathMatched) return;

        if (pathMatched[1] !== null) {
          user = decodeURIComponent(pathMatched[1].replace(/^:/, ''));
        }
        project = decodeURIComponent(pathMatched[2]);
        defaultRepresentation = protocolToRepresentation(parsed.protocol);
      }

      return new GitHost(gitHostName, user, auth, project, committish, defaultRepresentation, opts);
    } catch (ex) {
      if (!(ex instanceof URIError)) throw ex;
    }
  }).filter(gitHostInfo => gitHostInfo);

  return matches.length === 1 ? matches[0] : undefined;
}

function isGitHubShorthand(arg) {
  return /^[^:@%/\s.-][^:@%/\s]*[/][^:@\s/%]+(?:#.*)?$/.test(arg);
}

function fixupUnqualifiedGist(giturl) {
  const parsed = new URL(giturl);
  return (parsed.protocol === 'gist:' && parsed.host && !parsed.pathname) ? `${parsed.protocol}//${parsed.host}` : giturl;
}

function parseGitUrl(giturl) {
  const matched = giturl.match(/^([^@]+)@([^:/]+):[/]?((?:[^/]+[/])?[^/]+?)(?:[.]git)?(#.*)?$/);
  if (!matched) {
    const legacy = new URL(giturl);
    if (legacy.username) {
      const authmatch = giturl.match(/[^@]+@[^:/]+/);
      if (authmatch) {
        const whatwg = new URL(authmatch[0]);
        legacy.username = whatwg.username;
        legacy.password = whatwg.password;
      }
    }
    return legacy;
  }

  return {
    protocol: 'git+ssh:',
    slashes: true,
    auth: matched[1],
    host: matched[2],
    port: null,
    hostname: matched[2],
    hash: matched[4],
    search: null,
    query: null,
    pathname: '/' + matched[3],
    path: '/' + matched[3],
    href: `git+ssh://${matched[1]}@${matched[2]}/${matched[3]}${matched[4] || ''}`
  };
}
