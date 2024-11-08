function expand(inputStr) {
  if (!inputStr.includes('{')) return [inputStr];

  const finalExpansions = [];
  const processingStack = [[inputStr, 0]];

  while (processingStack.length > 0) {
    const [currentStr, startIndex] = processingStack.pop();
    const openBraceIndex = currentStr.indexOf('{', startIndex);
    if (openBraceIndex === -1) {
      finalExpansions.push(currentStr);
      continue;
    }

    const closeBraceIndex = getClosingBraceIndex(currentStr, openBraceIndex);
    if (closeBraceIndex === -1) {
      finalExpansions.push(currentStr);
      continue;
    }

    const prefix = currentStr.slice(0, openBraceIndex);
    const suffix = currentStr.slice(closeBraceIndex + 1);
    const braceContent = currentStr.slice(openBraceIndex + 1, closeBraceIndex);
    const expansionOptions = extractOptions(braceContent);

    for (const option of expansionOptions) {
      processingStack.push([prefix + option + suffix, openBraceIndex + option.length]);
    }
  }
  
  return finalExpansions;
}

function getClosingBraceIndex(str, openIndex) {
  let nestLevel = 1;
  for (let i = openIndex + 1; i < str.length; i++) {
    if (str[i] === '{') nestLevel++;
    if (str[i] === '}') nestLevel--;

    if (nestLevel === 0) return i;
  }
  return -1;
}

function extractOptions(content) {
  return content.match(/^-?\d+\.\.-?\d+(\.\.-?\d+)?$/)
    ? generateNumericRange(content)
    : content.split(',');
}

function generateNumericRange(rangeStr) {
  const [start, end, step] = rangeStr.split('..').map(Number);
  const stepValue = step || 1;
  const rangeArray = [];

  if (start <= end) {
    for (let i = start; i <= end; i += stepValue) {
      rangeArray.push(i.toString());
    }
  } else {
    for (let i = start; i >= end; i -= stepValue) {
      rangeArray.push(i.toString());
    }
  }

  return rangeArray;
}

module.exports = expand;
