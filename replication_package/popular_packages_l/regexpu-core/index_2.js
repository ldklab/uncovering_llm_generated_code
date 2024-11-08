// regexpu-core.js
const rewritePattern = (pattern, flags = '', options = {}) => {
  const {
    unicodeFlag, 
    dotAllFlag, 
    namedGroups, 
    onNamedGroup, 
    onNewFlags
  } = options;
  
  const handleFlags = (initialFlags) => {
    let newFlags = initialFlags.replace(unicodeFlag === 'transform' ? 'u' : '', '');
    if (onNewFlags) onNewFlags(newFlags);
    return newFlags;
  };

  const transformPattern = (pattern) => {
    let transformedPattern = pattern;

    if (unicodeFlag === 'transform') {
      transformedPattern = transformedPattern.replace(/\\u\{([0-9A-Fa-f]+)\}/g, (match, codeStr) => {
        const codePoint = parseInt(codeStr, 16);
        return codePoint <= 0xFFFF ? `\\u${codePoint.toString(16).padStart(4, '0')}`
          : `\\uD${((codePoint - 0x10000) >> 10) | 0xD800}\\uD${(codePoint & 0x3FF) | 0xDC00}`;
      });
    }

    if (dotAllFlag === 'transform') {
      transformedPattern = transformedPattern.replace(/\./g, '[\\0-\\uFFFF]');
    }

    if (namedGroups === 'transform') {
      transformedPattern = transformedPattern.replace(/\(\?<([A-Za-z_$][\w$]*)>/g, '(')
        .replace(/\\k<([\w$]+)>/g, (match, groupName) => {
          const groupRegex = new RegExp(`\\(\\?<${groupName}>`, 'g');
          const groupMatch = transformedPattern.match(groupRegex);
          if (onNamedGroup && groupMatch) onNamedGroup(groupName, groupMatch.index);
          return '\\1';
        });
    }

    return transformedPattern;
  };

  const finalPattern = transformPattern(pattern);
  const finalFlags = handleFlags(flags);

  return new RegExp(finalPattern, finalFlags).source;
};

module.exports = rewritePattern;

// Example usage:
const pattern = rewritePattern('foo.bar', 'u', { unicodeFlag: "transform" });
console.log(pattern);

const unicodeEscapes = rewritePattern('\\u{1D306}', '', { unicodeFlag: "transform" });
console.log(unicodeEscapes);
