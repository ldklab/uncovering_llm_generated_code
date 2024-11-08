function abbrev(...words) {
  const abbrevs = {};
  const sortedWords = words.sort();

  sortedWords.forEach((word) => {
    let expandedWord = word;
    let unique = false;
    let j = 0;
    
    while (!unique && j <= expandedWord.length) {
      const key = expandedWord.slice(0, j) || expandedWord;

      if (!abbrevs[key]) {
        abbrevs[key] = expandedWord;
        unique = true;
      } else if (abbrevs[key] !== expandedWord) {
        j++;
      } else {
        unique = true;
      }
    }
  });

  return abbrevs;
}

module.exports = abbrev;
