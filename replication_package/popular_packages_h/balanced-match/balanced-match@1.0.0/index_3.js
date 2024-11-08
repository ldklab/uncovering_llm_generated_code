'use strict';

module.exports = findBalancedSubstring;

function findBalancedSubstring(start, end, input) {
  if (start instanceof RegExp) start = extractMatch(start, input);
  if (end instanceof RegExp) end = extractMatch(end, input);

  const rangeIndexes = findRange(start, end, input);

  return rangeIndexes && {
    start: rangeIndexes[0],
    end: rangeIndexes[1],
    pre: input.slice(0, rangeIndexes[0]),
    body: input.slice(rangeIndexes[0] + start.length, rangeIndexes[1]),
    post: input.slice(rangeIndexes[1] + end.length)
  };
}

function extractMatch(pattern, input) {
  const match = input.match(pattern);
  return match ? match[0] : null;
}

findBalancedSubstring.findRange = findRange;

function findRange(start, end, input) {
  let openIndices = [], startPos, tempStart, tempEnd, balancedSubstring;
  let initialStartIndex = input.indexOf(start);
  let initialEndIndex = input.indexOf(end, initialStartIndex + 1);
  let position = initialStartIndex;

  if (initialStartIndex >= 0 && initialEndIndex > 0) {
    openIndices = [];
    tempStart = input.length;

    while (position >= 0 && !balancedSubstring) {
      if (position === initialStartIndex) {
        openIndices.push(position);
        initialStartIndex = input.indexOf(start, position + 1);
      } else if (openIndices.length === 1) {
        balancedSubstring = [openIndices.pop(), initialEndIndex];
      } else {
        startPos = openIndices.pop();
        if (startPos < tempStart) {
          tempStart = startPos;
          tempEnd = initialEndIndex;
        }

        initialEndIndex = input.indexOf(end, position + 1);
      }

      position = initialStartIndex < initialEndIndex && initialStartIndex >= 0 ? initialStartIndex : initialEndIndex;
    }

    if (openIndices.length) {
      balancedSubstring = [tempStart, tempEnd];
    }
  }

  return balancedSubstring;
}
