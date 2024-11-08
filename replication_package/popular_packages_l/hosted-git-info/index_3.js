class HostedGitInfo {
  constructor(type, domain, user, project, committish = 'HEAD') {
    this.type = type;
    this.domain = domain;
    this.user = user;
    this.project = project;
    this.committish = committish;
  }

  static fromUrl(url, opts = {}) {
    const patterns = [
      { regex: /git@github\.com:(.+?)\/(.+?)\.git/, type: 'github', domain: 'github.com' },
      { regex: /https:\/\/github\.com\/(.+?)\/(.+?)(\.git)?/, type: 'github', domain: 'github.com' }
    ];

    for (const { regex, type, domain } of patterns) {
      const match = url.match(regex);
      if (match) {
        return new HostedGitInfo(type, domain, match[1], match[2], opts.committish);
      }
    }
    return null;
  }

  file(path, opts = {}) {
    const committish = this.committish || 'HEAD';
    return `https://raw.${this.domain}/${this.user}/${this.project}/${committish}/${path}`;
  }

  browse(path = '', fragment = '', opts = {}) {
    const committish = this.committish || 'HEAD';
    const url = `https://${this.domain}/${this.user}/${this.project}/tree/${committish}/${path}`;
    return fragment ? `${url}#${fragment}` : url;
  }

  bugs(opts = {}) {
    return `https://${this.domain}/${this.user}/${this.project}/issues`;
  }

  docs(opts = {}) {
    const committish = this.committish || 'HEAD';
    return `https://${this.domain}/${this.user}/${this.project}/tree/${committish}#readme`;
  }

  https(opts = {}) {
    return `git+https://${this.domain}/${this.user}/${this.project}.git`;
  }

  sshurl(opts = {}) {
    return `git+ssh://git@${this.domain}/${this.user}/${this.project}.git`;
  }

  ssh(opts = {}) {
    return `git@${this.domain}:${this.user}/${this.project}.git`;
  }

  path(opts = {}) {
    return `${this.user}/${this.project}`;
  }

  tarball(opts = {}) {
    const committish = this.committish || 'HEAD';
    return `https://${this.domain}/${this.user}/${this.project}/archive/${committish}.tar.gz`;
  }

  getDefaultRepresentation() {
    return this.toString();
  }

  toString(opts = {}) {
    return `git@${this.domain}:${this.user}/${this.project}.git`;
  }
}

module.exports = HostedGitInfo;
