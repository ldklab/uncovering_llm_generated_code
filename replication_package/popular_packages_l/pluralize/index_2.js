(function(global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.pluralize = factory();
  }
}(typeof window !== 'undefined' ? window : this, function() {
  let pluralRules = [];
  let singularRules = [];
  let irregularRules = {};
  let uncountableRules = {};

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
    const isSingle = count != null && count === 1;
    const resultWord = isSingle ? singular(word) : plural(word);
    return inclusive ? `${count || 0} ${resultWord}` : resultWord;
  };

  const plural = (word) => {
    if (isUncountable(word)) return word;
    return applyRules(word, pluralRules, irregularRules) || word;
  };

  const singular = (word) => {
    if (isUncountable(word)) return word;
    return applyRules(word, singularRules, irregularRules) || word;
  };

  const applyRules = (word, rules, irregular) => {
    const lowercased = word.toLowerCase();
    if (irregular && irregular[lowercased]) return irregular[lowercased];

    for (let i = 0; i < rules.length; i++) {
      if (rules[i][0].test(lowercased)) {
        return word.replace(rules[i][0], rules[i][1]);
      }
    }
    return null;
  };

  const isPlural = (word) => plural(word) === word && !isSingular(word);
  const isSingular = (word) => singular(word) === word && !isPlural(word);
  
  // Example default rules, users can add more using provided functions.
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
