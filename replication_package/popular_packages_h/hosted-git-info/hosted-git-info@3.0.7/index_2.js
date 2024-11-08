'use strict';

const { parse: legacyParse, URL } = require('url');
const gitHosts = require('./git-host-info.js');
const GitHost = require('./git-host.js');
const LRU = require('lru-cache');
const cache = new LRU({ max: 1000 });

const protocolToRepresentationMap = {
  'git+ssh:': 'sshurl',
  'git+https:': 'https',
  'ssh:': 'sshurl',
  'git:': 'git',
};

function protocolToRepresentation(protocol) {
  return protocolToRepresentationMap[protocol] || protocol.slice(0, -1);
}

const authProtocols = new Set(['git:', 'https:', 'git+https:', 'http:', 'git+http:']);

module.exports.fromUrl = function (giturl, opts = {}) {
  if (typeof giturl !== 'string') return;
  const key = giturl + JSON.stringify(opts);

  if (!cache.has(key)) {
    cache.set(key, fromUrl(giturl, opts));
  }

  return cache.get(key);
};

function fromUrl(giturl, opts) {
  if (!giturl) return;

  const url = fixupUnqualifiedGist(isGitHubShorthand(giturl) ? `github:${giturl}` : giturl);
  const parsed = parseGitUrl(url);
  const shortcutMatch = url.match(/^([^:]+):(?:[^\@:\s]+(?:[^\@]+)?@)?([^/]+)\/(.+?)(?:\.git)?(?=$|#)/);

  const matches = Object.keys(gitHosts).map(gitHostName => {
    try {
      const gitHostInfo = gitHosts[gitHostName];
      const { auth: parsedAuth, protocol: parsedProtocol, host, path, hash } = parsed;
      let auth = null;
      
      if (parsedAuth && authProtocols.has(parsedProtocol)) auth = parsedAuth;

      const committish = hash ? decodeURIComponent(hash.slice(1)) : null;
      let user = null;
      let project = null;
      let defaultRepresentation = null;

      if (shortcutMatch && shortcutMatch[1] === gitHostName) {
        user = shortcutMatch[2] && decodeURIComponent(shortcutMatch[2]);
        project = decodeURIComponent(shortcutMatch[3]);
        defaultRepresentation = 'shortcut';
      } else {
        if (host && host !== gitHostInfo.domain && host.replace(/^www\./, '') !== gitHostInfo.domain) return;
        if (!gitHostInfo.protocols_re.test(parsedProtocol)) return;
        if (!path) return;

        const pathmatch = gitHostInfo.pathmatch;
        const matched = path.match(pathmatch);
        if (!matched) return;

        if (matched[1]) {
          user = decodeURIComponent(matched[1].replace(/^:/, ''));
        }
        project = decodeURIComponent(matched[2]);
        defaultRepresentation = protocolToRepresentation(parsedProtocol);
      }

      return new GitHost(gitHostName, user, auth, project, committish, defaultRepresentation, opts);
    } catch (ex) {
      if (!(ex instanceof URIError)) throw ex;
    }
  }).filter(Boolean);

  if (matches.length === 1) return matches[0];
}

function isGitHubShorthand(arg) {
  return /^[^:@%/\s.-][^:@%/\s]*\/[^:@\s/%]+(?:#.*)?$/.test(arg);
}

function fixupUnqualifiedGist(giturl) {
  const parsed = legacyParse(giturl);
  if (parsed.protocol === 'gist:' && parsed.host && !parsed.path) {
    return `${parsed.protocol}//${parsed.host}`;
  } else {
    return giturl;
  }
}

function parseGitUrl(giturl) {
  const matched = giturl.match(/^([^@]+)@([^:/]+):\/?([^/]+\/)?[^/]+?(?:\.git)?(#.*)?$/);
  if (!matched) {
    const legacy = legacyParse(giturl);

    if (legacy.auth) {
      const authmatch = giturl.match(/[^@]+@[^:/]+/);
      if (authmatch) {
        const whatwg = new URL(authmatch[0]);
        legacy.auth = whatwg.username || '';
        if (whatwg.password) legacy.auth += `:${whatwg.password}`;
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
    pathname: `/${matched[3]}`,
    path: `/${matched[3]}`,
    href: `git+ssh://${matched[1]}@${matched[2]}/${matched[3]}${matched[4] || ''}`,
  };
}
