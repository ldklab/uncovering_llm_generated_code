class Abbrev {
  static monkeyPatch() {
    Object.defineProperty(Array.prototype, 'abbrev', {
      value: function () { return Abbrev.generate(this); },
      enumerable: false, configurable: true, writable: true
    });

    Object.defineProperty(Object.prototype, 'abbrev', {
      value: function () { return Abbrev.generate(Object.keys(this)); },
      enumerable: false, configurable: true, writable: true
    });
  }

  static generate(...args) {
    let list = Array.isArray(args[0]) ? args[0] : args;
    list = list.map(item => typeof item === "string" ? item : String(item));
    list.sort(Abbrev.lexSort);

    const abbrevs = {};
    let prev = "";
    for (let i = 0; i < list.length; i++) {
      const current = list[i];
      const next = list[i + 1] || "";
      if (current === next) continue;
      
      let nextMatches = true, prevMatches = true, j;
      for (j = 0; j < current.length; j++) {
        const curChar = current.charAt(j);
        nextMatches = nextMatches && curChar === next.charAt(j);
        prevMatches = prevMatches && curChar === prev.charAt(j);
        if (!nextMatches && !prevMatches) break;
      }
      prev = current;

      if (j === current.length) {
        abbrevs[current] = current;
      } else {
        for (let abbrev = current.substr(0, j); j <= current.length; j++) {
          abbrevs[abbrev] = current;
          abbrev += current.charAt(j);
        }
      }
    }
    return abbrevs;
  }

  static lexSort(a, b) {
    return a.localeCompare(b);
  }
}

module.exports = Abbrev;
