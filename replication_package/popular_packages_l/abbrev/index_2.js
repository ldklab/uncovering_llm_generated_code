function abbrev(...words) {
  const abbrevs = {};
  const sortedWords = words.sort();

  sortedWords.forEach(word => {
    let currentPrefix = '';

    for (let index = 0; index <= word.length; index++) {
      currentPrefix = word.slice(0, index);

      if (!abbrevs[currentPrefix]) {
        abbrevs[currentPrefix] = word;
        break;
      } else if (abbrevs[currentPrefix] !== word) {
        currentPrefix = word;
        abbrevs[currentPrefix] = word;
      }
    }
  });

  return abbrevs;
}

module.exports = abbrev;
