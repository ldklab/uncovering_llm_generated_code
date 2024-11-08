function abbrev(...words) {
  const abbrevs = {};
  const sortedWords = words.sort();

  sortedWords.forEach(word => {
    let j = 0;
    while (j <= word.length) {
      let key = word.slice(0, j) || word;

      if (!abbrevs[key] || abbrevs[key] === word) {
        abbrevs[key] = word;
        j++;
      } else {
        j++;
      }
    }
  });

  return abbrevs;
}

module.exports = abbrev;