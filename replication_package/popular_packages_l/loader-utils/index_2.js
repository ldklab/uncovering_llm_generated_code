// loader-utils.js

const path = require('path');
const crypto = require('crypto');

const loaderUtils = {
  isUrlRequest(url) {
    return !/^data:|^chrome:|^https?:/.test(url);
  },

  urlToRequest(url, root = '') {
    if (url.startsWith('~')) {
      return url.slice(1);
    }

    if (root) {
      if (root === '~') {
        return url.slice(1);
      }
      if (url.startsWith('/')) {
        return path.posix.join(root, url.slice(1));
      }
    }

    if (!/^\.\.?\/|^\//.test(url)) {
      return './' + url;
    }
    return url;
  },

  interpolateName(loaderContext, name, options = {}) {
    const { resourcePath = '', resourceQuery = '' } = loaderContext;
    const context = options.context || process.cwd();
    const content = options.content || '';
    
    let regExp = options.regExp;
    if (typeof regExp === 'string') regExp = new RegExp(regExp);

    const ext = path.extname(resourcePath);
    const baseName = path.basename(resourcePath, ext);
    const dirName = path.dirname(resourcePath);
    const folderName = path.basename(dirName);

    const hashOptions = { content, hashType: 'xxhash64', digestType: 'hex', maxLength: undefined };
    const contentHash = this.getHashDigest(Buffer.from(content), hashOptions.hashType, hashOptions.digestType, hashOptions.maxLength);
    
    const replacements = {
      '[ext]': ext.slice(1),
      '[name]': baseName,
      '[path]': path.relative(context, dirName),
      '[folder]': folderName,
      '[query]': resourceQuery,
      '[contenthash]': contentHash,
      '[hash]': contentHash,
    };

    if (regExp && resourcePath) {
      const match = resourcePath.match(regExp);
      if (match) {
        match.forEach((matched, idx) => {
          replacements[`[${idx}]`] = matched;
        });
      }
    }

    return name.replace(/\[(\w+)(?::(\w+))?(?::(\w+))?(?::(\d+))?\]/gi, (match, token, hashType, digestType, maxLength) => {
      if (replacements[match] !== undefined) {
        return replacements[match];
      }
      if (token === 'hash' || token === 'contenthash') {
        return this.getHashDigest(content, hashType || 'xxhash64', digestType || 'hex', parseInt(maxLength, 10));
      }
      return match;
    });
  },

  getHashDigest(buffer, hashType = 'xxhash64', digestType = 'hex', maxLength) {
    const hash = crypto.createHash(hashType);
    hash.update(buffer);
    let digest = hash.digest(digestType);
    if (maxLength) {
      digest = digest.slice(0, maxLength);
    }

    if (digestType === 'base64safe') {
      digest = digest.replace(/[/+]/g, '_').replace(/=/g, '');
    }

    return digest;
  }
};

module.exports = loaderUtils;
