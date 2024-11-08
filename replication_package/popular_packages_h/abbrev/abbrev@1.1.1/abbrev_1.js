module.exports = exports = abbreviationTool.abbrev = abbreviationTool;

abbreviationTool.addPrototypeMethods = addPrototypeMethods;

function addPrototypeMethods() {
  Object.defineProperty(Array.prototype, 'abbrev', {
    value: function () { return abbreviationTool(this) },
    enumerable: false, configurable: true, writable: true
  });

  Object.defineProperty(Object.prototype, 'abbrev', {
    value: function () { return abbreviationTool(Object.keys(this)) },
    enumerable: false, configurable: true, writable: true
  });
}

function abbreviationTool(input) {
  if (arguments.length !== 1 || !Array.isArray(input)) {
    input = Array.prototype.slice.call(arguments, 0);
  }

  for (let i = 0, len = input.length, strList = []; i < len; i++) {
    strList[i] = typeof input[i] === "string" ? input[i] : String(input[i]);
  }

  strList.sort(compareLexically);

  const abbreviations = {};
  let previous = "";

  for (let i = 0, length = strList.length; i < length; i++) {
    const current = strList[i];
    const next = strList[i + 1] || "";
    let overlapsNext = true;
    let overlapsPrevious = true;

    if (current === next) continue;

    for (let j = 0, curLength = current.length; j < curLength; j++) {
      const char = current[j];
      overlapsNext &= (char === next[j]);
      overlapsPrevious &= (char === previous[j]);

      if (!overlapsNext && !overlapsPrevious) {
        j++;
        break;
      }
    }

    previous = current;

    if (j === curLength) {
      abbreviations[current] = current;
      continue;
    }

    for (let abbrev = current.substring(0, j); j <= curLength; j++) {
      abbreviations[abbrev] = current;
      abbrev += current[j];
    }
  }

  return abbreviations;
}

function compareLexically(a, b) {
  return a.localeCompare(b);
}
