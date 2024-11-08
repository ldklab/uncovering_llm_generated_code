// regex-rewriter.js
const rewritePattern = (pattern, flags = '', options = {}) => {
  const { unicodeFlag, dotAllFlag, namedGroups, onNamedGroup, onNewFlags } = options;
  
  // Adjusts the flags based on the options
  const manageFlags = (initialFlags) => {
    let adjustedFlags = initialFlags;
    if (unicodeFlag === 'transform') {
      adjustedFlags = adjustedFlags.replace('u', '');
    }
    if (onNewFlags) onNewFlags(adjustedFlags);
    return adjustedFlags;
  };

  // Transforms the given pattern as per options
  const adjustPattern = (pattern) => {
    let modifiedPattern = pattern;

    if (unicodeFlag === 'transform') {
      modifiedPattern = modifiedPattern.replace(/\\u\{[0-9A-Fa-f]+\}/g, (match) => {
        const codePoint = parseInt(match.slice(3, -1), 16);
        return codePoint <= 0xFFFF ? `\\u${codePoint.toString(16).padStart(4, '0')}` : `\\uD${((codePoint - 0x10000) >> 10) | 0x8000}\\uD${(codePoint & 0x3FF) | 0xDC00}`;
      });
    }

    if (dotAllFlag === 'transform') {
      modifiedPattern = modifiedPattern.replace(/\./g, '[\\0-\\uFFFF]');
    }

    if (namedGroups === 'transform') {
      modifiedPattern = modifiedPattern.replace(/\(\?<([\w$]+)>/g, '(').replace(/\\k<([\w$]+)>/g, (match, groupName) => {
        if (onNamedGroup) onNamedGroup(groupName, modifiedPattern.match(new RegExp(`\\(.*?(\\(\\?\\<${groupName}\\>).*?\\)`, 'g')).index);
        return '\\1'; // Simplified backreference assumption
      });
    }

    return modifiedPattern;
  };

  // Apply pattern transformations
  const updatedPattern = adjustPattern(pattern);

  // Finalize the flags after adjustments
  const updatedFlags = manageFlags(flags);

  return new RegExp(updatedPattern, updatedFlags).source;
};

module.exports = rewritePattern;

// Example use cases:
const patternExample = rewritePattern('foo.bar', 'u', { unicodeFlag: "transform" });
console.log(patternExample);

const unicodeExample = rewritePattern('\\u{1D306}', '', { unicodeFlag: "transform" });
console.log(unicodeExample);
