module.exports = abbrev;

function abbrev(...args) {
  let list = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;

  list = list.map(item => String(item)).sort(lexSort);

  const abbrevs = {};
  let previousItem = '';

  for (let currentIndex = 0; currentIndex < list.length; currentIndex++) {
    const currentItem = list[currentIndex];
    const nextItem = list[currentIndex + 1] || '';

    if (currentItem === nextItem) continue;

    let commonLength = 0;
    while (
      commonLength < currentItem.length &&
      (currentItem.charAt(commonLength) === nextItem.charAt(commonLength) ||
       currentItem.charAt(commonLength) === previousItem.charAt(commonLength))
    ) {
      commonLength++;
    }

    abbrevs[currentItem] = currentItem;
    for (let i = 1; i <= commonLength; i++) {
      abbrevs[currentItem.slice(0, i)] = currentItem;
    }

    previousItem = currentItem;
  }

  return abbrevs;
}

function lexSort(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
