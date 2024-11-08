'use strict';

module.exports = findBalancedSubstring;

function findBalancedSubstring(startMarker, endMarker, inputString) {
  if (startMarker instanceof RegExp) startMarker = findMatch(startMarker, inputString);
  if (endMarker instanceof RegExp) endMarker = findMatch(endMarker, inputString);

  const rangeIndices = calculateRange(startMarker, endMarker, inputString);

  return rangeIndices && {
    start: rangeIndices[0],
    end: rangeIndices[1],
    pre: inputString.slice(0, rangeIndices[0]),
    body: inputString.slice(rangeIndices[0] + startMarker.length, rangeIndices[1]),
    post: inputString.slice(rangeIndices[1] + endMarker.length)
  };
}

function findMatch(regex, string) {
  const match = string.match(regex);
  return match ? match[0] : null;
}

findBalancedSubstring.range = calculateRange;

function calculateRange(startMarker, endMarker, string) {
  let starts, start, leftmost, rightmost, balancedRange;
  let startIndex = string.indexOf(startMarker);
  let endIndex = string.indexOf(endMarker, startIndex + 1);
  let currentIndex = startIndex;

  if (startIndex >= 0 && endIndex > 0) {
    starts = [];
    leftmost = string.length;

    while (currentIndex >= 0 && !balancedRange) {
      if (currentIndex === startIndex) {
        starts.push(currentIndex);
        startIndex = string.indexOf(startMarker, currentIndex + 1);
      } else if (starts.length === 1) {
        balancedRange = [starts.pop(), endIndex];
      } else {
        start = starts.pop();
        if (start < leftmost) {
          leftmost = start;
          rightmost = endIndex;
        }
        endIndex = string.indexOf(endMarker, currentIndex + 1);
      }
      currentIndex = startIndex < endIndex && startIndex >= 0 ? startIndex : endIndex;
    }

    if (starts.length) {
      balancedRange = [leftmost, rightmost];
    }
  }

  return balancedRange;
}
