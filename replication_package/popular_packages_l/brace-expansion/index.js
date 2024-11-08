function expand(str) {
  if (!str.includes('{')) return [str];

  const results = [];
  const stack = [[str, 0]];

  while (stack.length > 0) {
    const [currStr, index] = stack.pop();
    const nextBrace = currStr.indexOf('{', index);
    if (nextBrace === -1) {
      results.push(currStr);
      continue;
    }

    const closeBrace = findClosingBrace(currStr, nextBrace);
    if (closeBrace === -1) {
      results.push(currStr);
      continue;
    }

    const beforeBrace = currStr.slice(0, nextBrace);
    const afterBrace = currStr.slice(closeBrace + 1);
    const content = currStr.slice(nextBrace + 1, closeBrace);
    const options = parseOptions(content);

    for (const opt of options) {
      stack.push([beforeBrace + opt + afterBrace, nextBrace + opt.length]);
    }
  }

  return results;
}

function findClosingBrace(str, openIndex) {
  let level = 1;
  for (let i = openIndex + 1; i < str.length; i++) {
    if (str[i] === '{') level++;
    if (str[i] === '}') level--;

    if (level === 0) return i;
  }
  return -1;
}

function parseOptions(content) {
  if (content.match(/^-?\d+\.\.-?\d+(\.\.-?\d+)?$/)) {
    return numericExpansion(content);
  } else {
    return content.split(',');
  }
}

function numericExpansion(range) {
  const [start, end, step] = range.split('..').map(Number);
  const stepValue = step || 1;
  const res = [];

  if (start <= end) {
    for (let i = start; i <= end; i += stepValue) {
      res.push(i.toString());
    }
  } else {
    for (let i = start; i >= end; i -= stepValue) {
      res.push(i.toString());
    }
  }

  return res;
}

module.exports = expand;
