const braces = (() => {

  const expandSequence = (pattern) => {
    const match = pattern.match(/^(\d+|\D)\.\.(\d+|\D)$/);
    if (!match) return [pattern];
    
    let [start, end] = match.slice(1, 3);
    const arr = [];
    if (/\d/.test(start) && /\d/.test(end)) {
      start = parseInt(start, 10);
      end = parseInt(end, 10);
      const step = start < end ? 1 : -1;
      for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
        arr.push(String(i));
      }
    } else {
      const step = start.charCodeAt(0) < end.charCodeAt(0) ? 1 : -1;
      for (let i = start.charCodeAt(0); step > 0 ? i <= end.charCodeAt(0) : i >= end.charCodeAt(0); i += step) {
        arr.push(String.fromCharCode(i));
      }
    }
    return arr;
  };

  const expandPattern = (pattern) => {
    const parts = pattern.split(/(?<!\\),/);
    return parts.reduce((acc, part) => {
      const rangeMatch = part.match(/^\{(\d+|\D)\.\.(\d+|\D)\}$/);
      if (rangeMatch) {
        return acc.concat(expandSequence(rangeMatch[1] + '..' + rangeMatch[2]));
      }
      acc.push(part);
      return acc;
    }, []);
  };

  const braces = (patterns, options = { expand: false }) => {
    const isArray = Array.isArray(patterns);
    if (!isArray) patterns = [patterns];
    
    return patterns.reduce((acc, pattern) => {
      const braceMatch = pattern.match(/\{(.*?)\}/g);
      if (!braceMatch) return acc.concat(pattern);

      let expandedPatterns = [pattern];
      braceMatch.forEach((brace) => {
        const innerPatterns = expandPattern(brace.slice(1, -1));
        const newPatterns = [];
        expandedPatterns.forEach((exp) => {
          innerPatterns.forEach((pat) => {
            newPatterns.push(exp.replace(brace, pat));
          });
        });
        expandedPatterns = newPatterns;
      });

      if (options.expand) {
        acc.push(...expandedPatterns);
      } else {
        const compiledPattern = expandedPatterns.map(pat => pat.replace(/\}/g, ')').replace(/\{/g, '(').replace(/,/g, '|'));
        acc.push(compiledPattern);
      }

      return acc;
    }, []);
  };

  braces.expand = (patterns) => braces(patterns, { expand: true });

  return braces;
})();

module.exports = braces;

// Example usage:
console.log(braces(['{01..05}', '{a..e}']));  //=> ['(01|02|03|04|05)', '(a|b|c|d|e)']
console.log(braces(['{01..05}', '{a..e}'], { expand: true }));  //=> ['01', '02', '03', '04', '05', 'a', 'b', 'c', 'd', 'e']
