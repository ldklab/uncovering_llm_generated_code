function abbrev(...words) {
  const abbrevs = {};
  const sortedWords = words.sort();

  sortedWords.forEach((word, i) => {
    let expandedWord = word;

    for (let j = 0; j <= expandedWord.length; j++) {
      const key = expandedWord.slice(0, j) || expandedWord;

      if (!abbrevs.hasOwnProperty(key)) {
        abbrevs[key] = expandedWord;
      } else {
        while (abbrevs[key] !== expandedWord) {
          j++;
          key = expandedWord.slice(0, j);
          abbrevs[key] = expandedWord;
        }
      }
    }
  });

  return abbrevs;
}

module.exports = abbrev;