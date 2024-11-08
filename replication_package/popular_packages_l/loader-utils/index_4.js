// utils.js

const path = require('path');
const crypto = require('crypto');

const utils = {
  isUrlRequest(url) {
    return !/^data:|^chrome:|^https?:/.test(url);
  },

  urlToRequest(url, root = '') {
    if (url.startsWith('~')) return url.slice(1);
    if (root && url.startsWith('/')) {
      return root === '~' ? url.slice(1) : path.posix.join(root, url.slice(1));
    }
    return !/^\.\.?\/|^\//.test(url) ? `./${url}` : url;
  },

  interpolateName(loaderContext, name, options = {}) {
    const { resourcePath = '', resourceQuery = '' } = loaderContext;
    const context = options.context || process.cwd();
    const content = options.content || '';
    let regExp = options.regExp ? new RegExp(options.regExp) : null;

    const { ext, base: baseName, dir } = path.parse(resourcePath);
    const folderName = path.basename(dir);

    const contentHash = this.getHashDigest(Buffer.from(content), 'xxhash64', 'hex');

    const replacements = {
      '[ext]': ext.slice(1),
      '[name]': baseName,
      '[path]': path.relative(context, dir),
      '[folder]': folderName,
      '[query]': resourceQuery,
      '[contenthash]': contentHash,
      '[hash]': contentHash,
    };

    if (regExp) {
      const matches = resourcePath.match(regExp);
      if (matches) {
        matches.forEach((match, idx) => {
          replacements[`[${idx}]`] = match;
        });
      }
    }

    return name.replace(/\[(\w+)(?::(\w+))?(?::(\w+))?(?::(\d+))?\]/gi, (match, token, hashType, digestType, maxLength) => {
      if (replacements[match] !== undefined) return replacements[match];
      if (token === 'hash' || token === 'contenthash') {
        return this.getHashDigest(content, hashType || 'xxhash64', digestType || 'hex', Number(maxLength));
      }
      return match;
    });
  },

  getHashDigest(buffer, hashType = 'xxhash64', digestType = 'hex', maxLength) {
    const hash = crypto.createHash(hashType).update(buffer).digest(digestType);
    let digest = maxLength ? hash.slice(0, maxLength) : hash;
    if (digestType === 'base64safe') {
      digest = digest.replace(/[/+]/g, '_').replace(/=/g, '');
    }
    return digest;
  },
};

module.exports = utils;
