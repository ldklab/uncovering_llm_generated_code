// balanced-match.js

function balanced(a, b, str) {
  const range = findRange(a, b, str);
  if (!range) return undefined;
  
  return {
    start: range[0],
    end: range[1],
    pre: str.slice(0, range[0]),
    body: str.slice(range[0] + matchLength(a), range[1]),
    post: str.slice(range[1] + matchLength(b))
  };
}

function findRange(a, b, str) {
  const open = findMatch(a, str);
  if (!open) return undefined;

  const stack = [];
  let close;

  for (let i = open.index; i < str.length; i++) {
    if (startMatch(a, str, i)) {
      stack.push(i);
      i += matchLength(a) - 1;
    } else if (startMatch(b, str, i)) {
      if (!stack.length) return undefined;
      close = i;
      if (stack.length === 1) return [stack.pop(), close];
      stack.pop();
      i += matchLength(b) - 1;
    }
  }
  return undefined;
}

function matchLength(pattern) {
  return typeof pattern === 'string' ? pattern.length : 0;
}

function findMatch(pattern, str, fromIndex=0) {
  if (typeof pattern === 'string') {
    const index = str.indexOf(pattern, fromIndex);
    return index === -1 ? null : { index, match: pattern };
  } else {
    pattern.lastIndex = fromIndex;
    return pattern.exec(str);
  }
}

function startMatch(pattern, str, index) {
  return findMatch(pattern, str, index)?.index === index;
}

balanced.range = function(a, b, str) {
  return findRange(a, b, str);
};

module.exports = balanced;
