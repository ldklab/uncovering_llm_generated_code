const braces = (() => {

  const expandSequence = (pattern) => {
    const match = pattern.match(/^(\d+|\D)\.\.(\d+|\D)$/);
    if (!match) return [pattern];

    let [start, end] = match.slice(1, 3);
    const sequence = [];

    if (/\d/.test(start) && /\d/.test(end)) {
      // Handle numeric range
      start = parseInt(start, 10);
      end = parseInt(end, 10);
      const step = start < end ? 1 : -1;
      for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
        sequence.push(String(i));
      }
    } else {
      // Handle character range
      const step = start.charCodeAt(0) < end.charCodeAt(0) ? 1 : -1;
      for (let i = start.charCodeAt(0); step > 0 ? i <= end.charCodeAt(0) : i >= end.charCodeAt(0); i += step) {
        sequence.push(String.fromCharCode(i));
      }
    }

    return sequence;
  };

  const expandPattern = (pattern) => {
    const parts = pattern.split(/(?<!\\),/);
    return parts.reduce((results, part) => {
      const rangeMatch = part.match(/^\{(\d+|\D)\.\.(\d+|\D)\}$/);
      if (rangeMatch) {
        results.push(...expandSequence(rangeMatch[1] + '..' + rangeMatch[2]));
      } else {
        results.push(part);
      }
      return results;
    }, []);
  };

  const braces = (patterns, options = { expand: false }) => {
    const isArray = Array.isArray(patterns);
    if (!isArray) patterns = [patterns];

    return patterns.reduce((resultSet, pattern) => {
      const braceMatches = pattern.match(/\{(.*?)\}/g);
      if (!braceMatches) return resultSet.concat(pattern);

      let generatedPatterns = [pattern];
      braceMatches.forEach((braceContent) => {
        const innerPatterns = expandPattern(braceContent.slice(1, -1));
        const newGenerated = [];
        generatedPatterns.forEach((genPattern) => {
          innerPatterns.forEach((innerPattern) => {
            newGenerated.push(genPattern.replace(braceContent, innerPattern));
          });
        });
        generatedPatterns = newGenerated;
      });

      if (options.expand) {
        resultSet.push(...generatedPatterns);
      } else {
        const compactForm = generatedPatterns.map(pat => pat.replace(/\}/g, ')').replace(/\{/g, '(').replace(/\|/g, '|'));
        resultSet.push(compactForm);
      }

      return resultSet;
    }, []);
  };

  braces.expand = (patterns) => braces(patterns, { expand: true });

  return braces;
})();

module.exports = braces;

// Example usage:
console.log(braces(['{01..05}', '{a..e}']));  //=> ['(01|02|03|04|05)', '(a|b|c|d|e)']
console.log(braces(['{01..05}', '{a..e}'], { expand: true }));  //=> ['01', '02', '03', '04', '05', 'a', 'b', 'c', 'd', 'e']
