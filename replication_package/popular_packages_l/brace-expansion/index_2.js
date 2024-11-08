function expand(str) {
  if (!str.includes('{')) return [str];

  const results = [];
  const stack = [[str, 0]];

  while (stack.length > 0) {
    const [current, index] = stack.pop();
    const nextBraceIndex = current.indexOf('{', index);
    if (nextBraceIndex === -1) {
      results.push(current);
      continue;
    }

    const closeBraceIndex = findClosingBrace(current, nextBraceIndex);
    if (closeBraceIndex === -1) {
      results.push(current);
      continue;
    }

    const prefix = current.slice(0, nextBraceIndex);
    const suffix = current.slice(closeBraceIndex + 1);
    const content = current.slice(nextBraceIndex + 1, closeBraceIndex);
    const options = parseOptions(content);

    for (const option of options) {
      stack.push([prefix + option + suffix, nextBraceIndex + option.length]);
    }
  }

  return results;
}

function findClosingBrace(str, openIndex) {
  let depth = 1;
  for (let i = openIndex + 1; i < str.length; i++) {
    if (str[i] === '{') depth++;
    if (str[i] === '}') depth--;
    if (depth === 0) return i;
  }
  return -1;
}

function parseOptions(content) {
  if (/^-?\d+\.\.-?\d+(\.\.-?\d+)?$/.test(content)) {
    return expandNumericRange(content);
  } else {
    return content.split(',');
  }
}

function expandNumericRange(range) {
  const [start, end, step] = range.split('..').map(Number);
  const stepValue = step || 1;
  const expandedRange = [];

  if (start <= end) {
    for (let i = start; i <= end; i += stepValue) {
      expandedRange.push(i.toString());
    }
  } else {
    for (let i = start; i >= end; i -= stepValue) {
      expandedRange.push(i.toString());
    }
  }

  return expandedRange;
}

module.exports = expand;
