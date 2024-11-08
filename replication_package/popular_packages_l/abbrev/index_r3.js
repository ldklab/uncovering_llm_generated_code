function abbrev(...words) {
  const abbrevs = {};
  const sortedWords = words.sort();

  sortedWords.forEach((word) => {
    let j = 0;
    let key = '';

    while (j <= word.length) {
      key = word.slice(0, j);
      
      if (!abbrevs.hasOwnProperty(key)) {
        abbrevs[key] = word;
        break;
      }

      // Move to the next character if the key is not unique
      j++;
    }
  });

  return abbrevs;
}

module.exports = abbrev;