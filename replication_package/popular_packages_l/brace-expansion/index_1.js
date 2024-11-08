function expand(inputStr) {
  if (!inputStr.includes('{')) return [inputStr];

  const results = [];
  const stack = [[inputStr, 0]];

  while (stack.length > 0) {
    const [currentString, currentIndex] = stack.pop();
    const nextOpenBrace = currentString.indexOf('{', currentIndex);
    if (nextOpenBrace === -1) {
      results.push(currentString);
      continue;
    }

    const correspondingCloseBrace = locateClosingBrace(currentString, nextOpenBrace);
    if (correspondingCloseBrace === -1) {
      results.push(currentString);
      continue;
    }

    const prefixString = currentString.slice(0, nextOpenBrace);
    const suffixString = currentString.slice(correspondingCloseBrace + 1);
    const braceContent = currentString.slice(nextOpenBrace + 1, correspondingCloseBrace);
    const options = extractOptions(braceContent);

    options.forEach(option => {
      stack.push([prefixString + option + suffixString, nextOpenBrace + option.length]);
    });
  }

  return results;
}

function locateClosingBrace(str, openBraceIndex) {
  let braceLevel = 1;
  for (let i = openBraceIndex + 1; i < str.length; i++) {
    if (str[i] === '{') braceLevel++;
    if (str[i] === '}') braceLevel--;

    if (braceLevel === 0) return i;
  }
  return -1;
}

function extractOptions(content) {
  if (/^-?\d+\.\.-?\d+(\.\.-?\d+)?$/.test(content)) {
    return generateNumericSequence(content);
  } else {
    return content.split(',');
  }
}

function generateNumericSequence(rangeExpression) {
  const [startValue, endValue, stepValue] = rangeExpression.split('..').map(Number);
  const increment = stepValue || 1;
  const sequence = [];

  if (startValue <= endValue) {
    for (let num = startValue; num <= endValue; num += increment) {
      sequence.push(num.toString());
    }
  } else {
    for (let num = startValue; num >= endValue; num -= increment) {
      sequence.push(num.toString());
    }
  }

  return sequence;
}

module.exports = expand;
