const path = require('path');
const crypto = require('crypto');

const loaderUtils = {
  isUrlRequest: function(url) {
    // Infers if the URL is one that can be requested
    return !/^data:|^chrome:|^https?:/.test(url);
  },

  urlToRequest: function(url, root = '') {
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

  interpolateName: function(loaderContext, name, options = {}) {
    const { resourcePath = '', resourceQuery = '' } = loaderContext;
    const context = options.context || process.cwd();
    const content = options.content || null;
    let regExp = options.regExp;

    if (typeof regExp === 'string') {
      regExp = new RegExp(regExp);
    }

    const ext = path.extname(resourcePath);
    const baseName = path.basename(resourcePath, ext);
    const dirName = path.dirname(resourcePath);
    const folderName = path.basename(dirName);

    const hashOptions = { content, hashType: 'xxhash64', digestType: 'hex', maxLength: undefined };
    const contentHash = this.getHashDigest(Buffer.from(content || ''), hashOptions.hashType, hashOptions.digestType, hashOptions.maxLength);
    
    const replacements = {
      '[ext]': ext.slice(1),
      '[name]': baseName,
      '[path]': path.relative(context, dirName),
      '[folder]': folderName,
      '[query]': resourceQuery,
      '[contenthash]': contentHash,
      '[hash]': contentHash,
    };

    if (regExp && loaderContext.resourcePath) {
      const match = loaderContext.resourcePath.match(regExp);
      if (match) {
        match.forEach((matched, index) => {
          replacements[`[${index}]`] = matched;
        });
      }
    }

    return name.replace(/\[(\w+)(?::(\w+))?(?::(\w+))?(?::(\d+))?\]/gi, (match, token, hashType, digestType, maxLength) => {
      if (typeof replacements[match] !== 'undefined') {
        return replacements[match];
      }
      if (token === 'hash' || token === 'contenthash') {
        return this.getHashDigest(content, hashType || 'xxhash64', digestType || 'hex', parseInt(maxLength, 10));
      }
      return match;
    });
  },

  getHashDigest: function(buffer, hashType = 'xxhash64', digestType = 'hex', maxLength) {
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
