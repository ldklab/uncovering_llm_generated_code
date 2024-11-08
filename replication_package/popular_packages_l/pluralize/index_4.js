(function(exports, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    exports.pluralize = factory();
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
    const singularLower = singular.toLowerCase();
    const pluralLower = plural.toLowerCase();
    irregularRules[singularLower] = pluralLower;
    irregularRules[pluralLower] = singularLower;
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

    if (irregularRules[word.toLowerCase()]) {
      return irregularRules[word.toLowerCase()];
    }

    return applyRules(word, pluralRules);
  }

  function singular(word) {
    if (isUncountable(word)) return word;
    
    if (irregularRules[word.toLowerCase()]) {
      return irregularRules[word.toLowerCase()];
    }

    return applyRules(word, singularRules);
  }

  function applyRules(word, rules) {
    const lower = word.toLowerCase();
    for (let i = 0; i < rules.length; i++) {
      const [ruleRegex, ruleReplacement] = rules[i];
      if (ruleRegex.test(lower)) {
        return word.replace(ruleRegex, ruleReplacement);
      }
    }
    return word;
  }

  function isPlural(word) {
    return plural(word) === word && !isSingular(word);
  }

  function isSingular(word) {
    return singular(word) === word && !isPlural(word);
  }
  
  // Predefined rule examples. Users can extend with addPluralRule, etc.
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
