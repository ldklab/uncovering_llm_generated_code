module.exports = createAbbreviations;

function createAbbreviations(...args) {
  const list = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;

  const stringList = list.map(item => String(item));
  stringList.sort(lexicographicalSort);

  const abbreviationMap = {};
  let previousString = '';

  for (let i = 0; i < stringList.length; i++) {
    const currentString = stringList[i];
    const nextString = stringList[i + 1] || '';
    if (currentString === nextString) continue;

    let abbrevLength = 0;
    while (abbrevLength < currentString.length) {
      const currentChar = currentString[abbrevLength];
      const matchesNext = currentChar === nextString[abbrevLength];
      const matchesPrevious = currentChar === previousString[abbrevLength];

      if (!matchesNext && !matchesPrevious) {
        abbrevLength++;
        break;
      }
      abbrevLength++;
    }

    previousString = currentString;
    let abbreviation = currentString.slice(0, abbrevLength);
    for (let j = abbrevLength; j <= currentString.length; j++) {
      abbreviationMap[abbreviation] = currentString;
      abbreviation += currentString[j] || '';
    }
  }

  return abbreviationMap;
}

function lexicographicalSort(a, b) {
  return a.localeCompare(b);
}