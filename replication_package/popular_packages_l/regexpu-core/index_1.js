// regexpu-core.js
const rewritePattern = (pattern, flags = '', options = {}) => {
  const { unicodeFlag, dotAllFlag, namedGroups, onNamedGroup, onNewFlags } = options;

  const handleFlags = (initialFlags) => {
    let newFlags = initialFlags.replace(unicodeFlag === 'transform' ? 'u' : '', '');
    onNewFlags && onNewFlags(newFlags);
    return newFlags;
  };

  const transformPattern = (pattern) => {
    let transformedPattern = pattern;
    if (unicodeFlag === 'transform') {
      transformedPattern = transformedPattern.replace(/\\u\{[0-9A-Fa-f]+\}/g, (match) => {
        const codePoint = parseInt(match.slice(3, -1), 16);
        return codePoint <= 0xFFFF
          ? `\\u${codePoint.toString(16).padStart(4, '0')}`
          : `\\uD${((codePoint - 0x10000) >> 10) | 0x8000}\\uD${(codePoint & 0x3FF) | 0xDC00}`;
      });
    }
    if (dotAllFlag === 'transform') {
      transformedPattern = transformedPattern.replace(/\./g, '[\\0-\\uFFFF]');
    }
    if (namedGroups === 'transform') {
      transformedPattern = transformedPattern.replace(/\(\?<[\w$]+>/g, '(').replace(/\\k<([\w$]+)>/g, (match, groupName) => {
        onNamedGroup && onNamedGroup(groupName, transformedPattern.indexOf(groupName));
        return '\\1';
      });
    }
    return transformedPattern;
  };

  const transformedPattern = transformPattern(pattern);
  const finalFlags = handleFlags(flags);

  return new RegExp(transformedPattern, finalFlags).source;
};

module.exports = rewritePattern;

// Example usage
console.log(rewritePattern('foo.bar', 'u', { unicodeFlag: "transform" }));
console.log(rewritePattern('\\u{1D306}', '', { unicodeFlag: "transform" }));
