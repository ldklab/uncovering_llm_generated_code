function expand(str) {
  if (!str.includes('{')) return [str];
  
  const results = [];
  const stack = [[str, 0]];

  while (stack.length) {
    const [current, index] = stack.pop();
    const openBraceIndex = current.indexOf('{', index);
    
    if (openBraceIndex === -1) {
      results.push(current);
      continue;
    }

    const closeBraceIndex = findMatchingBrace(current, openBraceIndex);
    if (closeBraceIndex === -1) {
      results.push(current);
      continue;
    }

    const prefix = current.slice(0, openBraceIndex);
    const suffix = current.slice(closeBraceIndex + 1);
    const braceContent = current.slice(openBraceIndex + 1, closeBraceIndex);
    const options = extractOptions(braceContent);

    options.forEach(opt => {
      stack.push([prefix + opt + suffix, openBraceIndex + opt.length]);
    });
  }

  return results;
}

function findMatchingBrace(str, openIndex) {
  let depth = 1;
  for (let i = openIndex + 1; i < str.length; i++) {
    if (str[i] === '{') depth++;
    if (str[i] === '}') depth--;
    if (depth === 0) return i;
  }
  return -1;
}

function extractOptions(content) {
  if (/^-?\d+\.\.-?\d+(\.\.-?\d+)?$/.test(content)) {
    return expandNumericRange(content);
  }
  return content.split(',');
}

function expandNumericRange(rangeStr) {
  const [start, end, step] = rangeStr.split('..').map(Number);
  const stepSize = step || 1;
  const expanded = [];

  if (start <= end) {
    for (let i = start; i <= end; i += stepSize) {
      expanded.push(i.toString());
    }
  } else {
    for (let i = start; i >= end; i -= stepSize) {
      expanded.push(i.toString());
    }
  }

  return expanded;
}

module.exports = expand;
