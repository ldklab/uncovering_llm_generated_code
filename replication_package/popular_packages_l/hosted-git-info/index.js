// hosted-git-info.js

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
      // Example regex patterns for parsing different Git hosts and URL types
      { regex: /git@github\.com:(.+?)\/(.+?)\.git/, type: 'github', domain: 'github.com' },
      { regex: /https:\/\/github\.com\/(.+?)\/(.+?)(\.git)?/, type: 'github', domain: 'github.com' },
      // Add patterns for other Git hosts like Bitbucket, GitLab, etc.
    ];

    for (const { regex, type, domain } of patterns) {
      const match = url.match(regex);
      if (match) {
        return new HostedGitInfo(type, domain, match[1], match[2], opts.committish);
      }
    }
    return null;
  }

  // Method to generate a file URL
  file(path, opts = {}) {
    const committish = this.committish || 'HEAD';
    return `https://raw.${this.domain}/${this.user}/${this.project}/${committish}/${path}`;
  }

  // Method to generate a browsing URL
  browse(path = '', fragment = '', opts = {}) {
    const committish = this.committish || 'HEAD';
    const url = `https://${this.domain}/${this.user}/${this.project}/tree/${committish}/${path}`;
    return fragment ? `${url}#${fragment}` : url;
  }

  // Method to generate an issue tracker URL
  bugs(opts = {}) {
    return `https://${this.domain}/${this.user}/${this.project}/issues`;
  }

  // Method to generate a documentation URL
  docs(opts = {}) {
    const committish = this.committish || 'HEAD';
    return `https://${this.domain}/${this.user}/${this.project}/tree/${committish}#readme`;
  }

  // Method to generate an HTTPS URL
  https(opts = {}) {
    return `git+https://${this.domain}/${this.user}/${this.project}.git`;
  }

  // Method to generate an SSH URL
  sshurl(opts = {}) {
    return `git+ssh://git@${this.domain}/${this.user}/${this.project}.git`;
  }

  // Method to generate a PAT URL
  ssh(opts = {}) {
    return `git@${this.domain}:${this.user}/${this.project}.git`;
  }

  // Method to generate a path shortcut
  path(opts = {}) {
    return `${this.user}/${this.project}`;
  }

  // Method to generate a tarball URL
  tarball(opts = {}) {
    const committish = this.committish || 'HEAD';
    return `https://${this.domain}/${this.user}/${this.project}/archive/${committish}.tar.gz`;
  }

  // Method to get the default URL representation of the resource
  getDefaultRepresentation() {
    return this.toString();
  }

  // Method to convert info to string form
  toString(opts = {}) {
    // Normalize based on input representation
    return `git@${this.domain}:${this.user}/${this.project}.git`;
  }
}

module.exports = HostedGitInfo;
