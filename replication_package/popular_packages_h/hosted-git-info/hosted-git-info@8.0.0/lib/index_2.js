'use strict';

const { LRUCache } = require('lru-cache');
const hosts = require('./hosts.js');
const fromUrl = require('./from-url.js');
const parseUrl = require('./parse-url.js');

class GitHost {
  static gitHosts = { byShortcut: {}, byDomain: {} };
  static protocols = {
    'git+ssh:': { name: 'sshurl' },
    'ssh:': { name: 'sshurl' },
    'git+https:': { name: 'https', auth: true },
    'git:': { auth: true },
    'http:': { auth: true },
    'https:': { auth: true },
    'git+http:': { auth: true },
  };

  static cache = new LRUCache({ max: 1000 });

  constructor(type, user, auth, project, committish, defaultRepresentation, opts = {}) {
    Object.assign(this, GitHost.gitHosts[type], {
      type,
      user,
      auth,
      project,
      committish,
      default: defaultRepresentation,
      opts,
    });
  }

  static addHost(name, host) {
    GitHost.gitHosts[name] = host;
    GitHost.gitHosts.byDomain[host.domain] = name;
    GitHost.gitHosts.byShortcut[`${name}:`] = name;
    GitHost.protocols[`${name}:`] = { name };
  }

  static fromUrl(giturl, opts) {
    if (typeof giturl !== 'string') return;
    const key = giturl + JSON.stringify(opts || {});
    if (!GitHost.cache.has(key)) {
      const hostArgs = fromUrl(giturl, opts, {
        gitHosts: GitHost.gitHosts,
        protocols: GitHost.protocols,
      });
      GitHost.cache.set(key, hostArgs ? new GitHost(...hostArgs) : undefined);
    }
    return GitHost.cache.get(key);
  }

  static parseUrl(url) {
    return parseUrl(url);
  }

  #fill(template, opts = {}) {
    if (typeof template !== 'function') return null;

    const options = { ...this, ...this.opts, ...opts };
    options.path = options.path ? options.path.replace(/^\/+/, '') : '';
    if (options.noCommittish) options.committish = null;

    const result = template(options);
    return options.noGitPlus && result.startsWith('git+') ? result.slice(4) : result;
  }

  hash() {
    return this.committish ? `#${this.committish}` : '';
  }

  ssh(opts) {
    return this.#fill(this.sshtemplate, opts);
  }

  sshurl(opts) {
    return this.#fill(this.sshurltemplate, opts);
  }

  browse(path, ...args) {
    const options = typeof path !== 'string'
      ? path
      : { ...args[Number(typeof args[0] === 'string')], fragment: args[0], path };
    return this.#fill(this.browsetreetemplate, options);
  }

  browseFile(path, ...args) {
    const options = { ...args[Number(typeof args[0] === 'string')], fragment: args[0], path };
    return this.#fill(this.browseblobtemplate, options);
  }

  docs(opts) {
    return this.#fill(this.docstemplate, opts);
  }

  bugs(opts) {
    return this.#fill(this.bugstemplate, opts);
  }

  https(opts) {
    return this.#fill(this.httpstemplate, opts);
  }

  git(opts) {
    return this.#fill(this.gittemplate, opts);
  }

  shortcut(opts) {
    return this.#fill(this.shortcuttemplate, opts);
  }

  path(opts) {
    return this.#fill(this.pathtemplate, opts);
  }

  tarball(opts) {
    return this.#fill(this.tarballtemplate, { ...opts, noCommittish: false });
  }

  file(path, opts) {
    return this.#fill(this.filetemplate, { ...opts, path });
  }

  edit(path, opts) {
    return this.#fill(this.edittemplate, { ...opts, path });
  }

  getDefaultRepresentation() {
    return this.default;
  }

  toString(opts) {
    return this.default && typeof this[this.default] === 'function'
      ? this[this.default](opts)
      : this.sshurl(opts);
  }
}

Object.entries(hosts).forEach(([name, host]) => {
  GitHost.addHost(name, host);
});

module.exports = GitHost;
