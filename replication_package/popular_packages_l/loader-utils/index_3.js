// loader-utils.js

const path = require('path');
const crypto = require('crypto');

const loaderUtils = {
  isUrlRequest(url) {
    return !/^data:|^chrome:|^https?:/.test(url);
  },

  urlToRequest(url, root = '') {
    if (url.startsWith('~')) return url.slice(1);
    if (root && url.startsWith('/')) return path.posix.join(root === '~' ? '' : root, url.slice(1));
    return /^\.\.?\/|^\//.test(url) ? url : './' + url;
  },

  interpolateName(loaderContext, name, options = {}) {
    const { resourcePath = '', resourceQuery = '', context = process.cwd(), content = null } = loaderContext;
    const { regExp } = options;
    const ext = path.extname(resourcePath).slice(1);
    const baseName = path.basename(resourcePath, '.' + ext);
    const folderName = path.basename(path.dirname(resourcePath));
    const contentHash = this.getHashDigest(Buffer.from(content || ''), 'xxhash64', 'hex');
    
    const replacements = {
      '[ext]': ext,
      '[name]': baseName,
      '[path]': path.relative(context, path.dirname(resourcePath)),
      '[folder]': folderName,
      '[query]': resourceQuery,
      '[contenthash]': contentHash,
      '[hash]': contentHash,
    };

    if (regExp && loaderContext.resourcePath) {
      (resourcePath.match(new RegExp(regExp)) || []).forEach((match, idx) => {
        replacements[`[${idx}]`] = match;
      });
    }

    return name.replace(/\[(\w+)(?::(\w+))?(?::(\w+))?(?::(\d+))?\]/gi, (match, token, ...rest) => {
      if (replacements[match] !== undefined) return replacements[match];
      if (['hash', 'contenthash'].includes(token)) {
        return this.getHashDigest(content, rest[0] || 'xxhash64', rest[1] || 'hex', parseInt(rest[2], 10));
      }
      return match;
    });
  },

  getHashDigest(buffer, hashType = 'xxhash64', digestType = 'hex', maxLength) {
    const hash = crypto.createHash(hashType);
    hash.update(buffer);

    let digest = hash.digest(digestType );
    digest = maxLength ? digest.slice(0, maxLength) : digest;

    if (digestType === 'base64safe') {
      digest = digest.replace(/[/+]/g, '_').replace(/=/g, '');
    }

    return digest;
  }
};

module.exports = loaderUtils;
