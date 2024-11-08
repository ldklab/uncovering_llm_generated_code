// loader-utils.js

const path = require('path');
const crypto = require('crypto');

const loaderUtils = {
  isUrlRequest(url) {
    // A simple check to infer if the given URL is requestable
    return !/^data:|^chrome:|^https?:/.test(url);
  },

  urlToRequest(url, root = '') {
    // If the url starts with '~', treat it as a module request
    if (url.startsWith('~')) {
      return url.slice(1);
    }

    // Handle root-relative URLs
    if (root) {
      if (root === '~') {
        return url.slice(1);
      }
      if (url.startsWith('/')) {
        return path.posix.join(root, url.slice(1));
      }
    }

    // Default behavior: prepend './' to treat it as a relative request
    if (!/^\.\.?\/|^\//.test(url)) {
      return './' + url;
    }
    return url;
  },

  interpolateName(loaderContext, name, options = {}) {
    const resourcePath = loaderContext.resourcePath || '';
    const resourceQuery = loaderContext.resourceQuery || '';
    
    const context = options.context || process.cwd();
    const content = options.content || null;
    
    let regExp = options.regExp;
    if (typeof regExp === 'string') regExp = new RegExp(regExp);

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
        match.forEach((matched, idx) => {
          replacements[`[${idx}]`] = matched;
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

  getHashDigest(buffer, hashType = 'xxhash64', digestType = 'hex', maxLength) {
    // Use crypto module to create hash
    const hash = crypto.createHash(hashType);
    hash.update(buffer);
    
    let digest = hash.digest(digestType);
    if (maxLength) {
      digest = digest.slice(0, maxLength);
    }

    // Handle base64safe by removing unsafe characters
    if (digestType === 'base64safe') {
      digest = digest.replace(/[/+]/g, '_').replace(/=/g, '');
    }

    return digest;
  }
};

module.exports = loaderUtils;
