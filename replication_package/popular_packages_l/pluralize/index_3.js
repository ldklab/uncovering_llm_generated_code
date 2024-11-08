(function(global, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.pluralize = factory();
  }
}(this, function() {
  const pluralRules = [];
  const singularRules = [];
  const irregularRules = {};
  const uncountableRules = {};

  function addPluralRule(regex, replacement) {
    pluralRules.push([regex, replacement]);
  }
  
  function addSingularRule(regex, replacement) {
    singularRules.push([regex, replacement]);
  }

  function addIrregularRule(singular, plural) {
    irregularRules[singular.toLowerCase()] = plural.toLowerCase();
    irregularRules[plural.toLowerCase()] = singular.toLowerCase();
  }

  function addUncountableRule(word) {
    uncountableRules[word.toLowerCase()] = true;
  }

  function isUncountable(word) {
    return !!uncountableRules[word.toLowerCase()];
  }

  function pluralize(word, count, inclusive) {
    if (count != null && count === 1) {
      return inclusive ? `${count} ${singular(word)}` : singular(word);
    }

    const pluralWord = isUncountable(word) ? word : plural(word);
    return inclusive ? `${count || 0} ${pluralWord}` : pluralWord;
  }

  function plural(word) {
    if (isUncountable(word)) return word;
    const lowerWord = word.toLowerCase();
    if (irregularRules[lowerWord]) return irregularRules[lowerWord];
    return applyRules(word, pluralRules);
  }

  function singular(word) {
    if (isUncountable(word)) return word;
    const lowerWord = word.toLowerCase();
    if (irregularRules[lowerWord]) return irregularRules[lowerWord];
    return applyRules(word, singularRules);
  }

  function applyRules(word, rules) {
    for (let [regex, replacement] of rules) {
      if (regex.test(word)) {
        return word.replace(regex, replacement);
      }
    }
    return word;
  }

  function isPlural(input) {
    return plural(input) === input && !isSingular(input);
  }

  function isSingular(input) {
    return singular(input) === input && !isPlural(input);
  }
  
  // Predefined basic pluralization rules.
  addPluralRule(/$/, 's');
  addPluralRule(/s$/i, 's');
  addSingularRule(/s$/i, '');

  return {
    pluralize,
    plural,
    singular,
    addPluralRule,
    addSingularRule,
    addIrregularRule,
    addUncountableRule,
    isPlural,
    isSingular
  };
}));
