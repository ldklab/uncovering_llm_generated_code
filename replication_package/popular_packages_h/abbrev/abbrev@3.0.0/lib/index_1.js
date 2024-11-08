module.exports = abbrev;

function abbrev(...args) {
  let list = (args.length === 1 && Array.isArray(args[0])) ? args[0] : args;

  list = list.map(item => String(item));

  list.sort(lexSort);

  const abbrevs = {};
  let prevWord = '';

  for (let i = 0; i < list.length; i++) {
    const currentWord = list[i];
    const nextWord = list[i + 1] || '';
    if (currentWord === nextWord) {
      continue;
    }

    let prefixLength = 0;
    while (
      prefixLength < currentWord.length &&
      (currentWord[prefixLength] === nextWord[prefixLength] ||
       currentWord[prefixLength] === prevWord[prefixLength])
    ) {
      prefixLength++;
    }

    prevWord = currentWord;

    for (let j = prefixLength + 1; j <= currentWord.length; j++) {
      abbrevs[currentWord.slice(0, j)] = currentWord;
    }
  }

  return abbrevs;
}

function lexSort(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
