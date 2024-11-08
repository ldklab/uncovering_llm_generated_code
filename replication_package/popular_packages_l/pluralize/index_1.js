(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.pluralize = factory();
  }
}(this, function() {
  const pluralRules = [];
  const singularRules = [];
  const irregularRules = {};
  const uncountableRules = {};

  const addPluralRule = (regex, replacement) => {
    pluralRules.push([regex, replacement]);
  };
  
  const addSingularRule = (regex, replacement) => {
    singularRules.push([regex, replacement]);
  };

  const addIrregularRule = (singular, plural) => {
    irregularRules[singular.toLowerCase()] = plural.toLowerCase();
    irregularRules[plural.toLowerCase()] = singular.toLowerCase();
  };

  const addUncountableRule = (word) => {
    uncountableRules[word.toLowerCase()] = true;
  };

  const isUncountable = (word) => !!uncountableRules[word.toLowerCase()];

  const pluralize = (word, count, inclusive) => {
    if (count != null && count === 1) {
      return inclusive ? `${count} ${singular(word)}` : singular(word);
    }

    const pluralWord = isUncountable(word) ? word : plural(word);
    return inclusive ? `${count || 0} ${pluralWord}` : pluralWord;
  };

  const plural = (word) => {
    if (isUncountable(word)) return word;
    const lowerWord = word.toLowerCase();
    for (let rule in irregularRules) {
      if (lowerWord === rule) return irregularRules[rule];
    }
    return applyRules(word, pluralRules);
  };

  const singular = (word) => {
    if (isUncountable(word)) return word;
    const lowerWord = word.toLowerCase();
    for (let rule in irregularRules) {
      if (lowerWord === rule) return irregularRules[rule];
    }
    return applyRules(word, singularRules);
  };

  const applyRules = (word, rules) => {
    for (let [regex, replacement] of rules) {
      if (regex.test(word.toLowerCase())) {
        return word.replace(regex, replacement);
      }
    }
    return word;
  };

  const isPlural = (word) => plural(word) === word && !isSingular(word);

  const isSingular = (word) => singular(word) === word && !isPlural(word);

  // Default pluralization and singularization rules
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
