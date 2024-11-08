module.exports = abbrev;

function abbrev(...args) {
  const list = (args.length === 1 && Array.isArray(args[0])) ? args[0] : args.map(String);
  
  list.sort(lexSort);

  const abbrevs = {};
  let previous = '';

  for (let i = 0; i < list.length; i++) {
    const current = String(list[i]);
    const next = String(list[i + 1] || '');
    if (current === next) continue;

    let j = 0;
    while (j < current.length && current[j] === next[j] && current[j] === previous[j]) {
      ++j;
    }
    
    previous = current;

    for (let k = j; k <= current.length; k++) {
      const abbreviation = current.slice(0, k);
      if (!abbrevs[abbreviation]) {
        abbrevs[abbreviation] = current;
      }
    }
  }

  return abbrevs;
}

function lexSort(a, b) {
  return a.localeCompare(b);
}