const braces = (() => {
  const generateSequence = (pattern) => {
    const match = pattern.match(/^(\d+|\D)\.\.(\d+|\D)$/);
    if (!match) return [pattern];
    
    let [start, end] = match.slice(1, 3);
    const sequence = [];
    if (/\d/.test(start) && /\d/.test(end)) {
      start = parseInt(start, 10);
      end = parseInt(end, 10);
      const step = start < end ? 1 : -1;
      for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
        sequence.push(String(i));
      }
    } else {
      const step = start.charCodeAt(0) < end.charCodeAt(0) ? 1 : -1;
      for (let i = start.charCodeAt(0); step > 0 ? i <= end.charCodeAt(0) : i >= end.charCodeAt(0); i += step) {
        sequence.push(String.fromCharCode(i));
      }
    }
    return sequence;
  };
  
  const generatePatterns = (pattern) => {
    const parts = pattern.split(/(?<!\\),/);
    return parts.reduce((result, part) => {
      const rangeMatch = part.match(/^\{(\d+|\D)\.\.(\d+|\D)\}$/);
      if (rangeMatch) {
        return result.concat(generateSequence(rangeMatch[1] + '..' + rangeMatch[2]));
      }
      result.push(part);
      return result;
    }, []);
  };
  
  const braces = (inputPatterns, options = { expand: false }) => {
    const isArrayInput = Array.isArray(inputPatterns);
    if (!isArrayInput) inputPatterns = [inputPatterns];
    
    return inputPatterns.reduce((result, pattern) => {
      const braceComponents = pattern.match(/\{(.*?)\}/g);
      if (!braceComponents) return result.concat(pattern);

      let expandedComponents = [pattern];
      braceComponents.forEach((component) => {
        const innerPatterns = generatePatterns(component.slice(1, -1));
        const newResults = [];
        expandedComponents.forEach((exp) => {
          innerPatterns.forEach((pat) => {
            newResults.push(exp.replace(component, pat));
          });
        });
        expandedComponents = newResults;
      });

      if (options.expand) {
        result.push(...expandedComponents);
      } else {
        const compiledForm = expandedComponents.map(pat => pat.replace(/\}/g, ')').replace(/\{/g, '(').replace(/\|/g, '|'));
        result.push(compiledForm);
      }
      
      return result;
    }, []);
  };

  braces.expand = (inputPatterns) => braces(inputPatterns, { expand: true });

  return braces;
})();

module.exports = braces;

// Example usage:
console.log(braces(['{01..05}', '{a..e}']));  //=> ['(01|02|03|04|05)', '(a|b|c|d|e)']
console.log(braces(['{01..05}', '{a..e}'], { expand: true }));  //=> ['01', '02', '03', '04', '05', 'a', 'b', 'c', 'd', 'e']
