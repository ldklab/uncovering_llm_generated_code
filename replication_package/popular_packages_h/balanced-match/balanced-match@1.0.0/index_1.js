'use strict';

module.exports = findBalancedSubstring;

function findBalancedSubstring(startDelimiter, endDelimiter, inputString) {
  if (startDelimiter instanceof RegExp) startDelimiter = getMatchedString(startDelimiter, inputString);
  if (endDelimiter instanceof RegExp) endDelimiter = getMatchedString(endDelimiter, inputString);

  const rangeResult = calculateRange(startDelimiter, endDelimiter, inputString);

  if (!rangeResult) return null;
  
  const [start, end] = rangeResult;
  return {
    start,
    end,
    pre: inputString.slice(0, start),
    body: inputString.slice(start + startDelimiter.length, end),
    post: inputString.slice(end + endDelimiter.length)
  };
}

function getMatchedString(regex, str) {
  const match = str.match(regex);
  return match ? match[0] : null;
}

findBalancedSubstring.calculateRange = calculateRange;

function calculateRange(start, end, str) {
  let begins = [];
  let i = str.indexOf(start);
  let startIdx = i, endIdx = str.indexOf(end, startIdx + 1);
  
  if (startIdx >= 0 && endIdx > 0) {
    let leftMost = str.length, currentStart;
    
    while (i >= 0) {
      if (i === startIdx) {
        begins.push(i);
        startIdx = str.indexOf(start, i + 1);
      } else if (begins.length === 1) {
        return [begins.pop(), endIdx];
      } else {
        currentStart = begins.pop();
        if (currentStart < leftMost) {
          leftMost = currentStart;
          endIdx = end === i ? endIdx : str.indexOf(end, i + 1);
        }
      }
      i = startIdx < endIdx && startIdx >= 0 ? startIdx : endIdx;
    }
    if (begins.length) return [leftMost, endIdx];
  }

  return undefined;
}
