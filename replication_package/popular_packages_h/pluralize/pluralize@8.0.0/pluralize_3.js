((root, factory) => {
  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(() => factory());
  } else {
    root.pluralize = factory();
  }
})(this, () => {
  const pluralRules = [];
  const singularRules = [];
  const uncountables = new Set();
  const irregularPlurals = new Map();
  const irregularSingles = new Map();

  const sanitizeRule = rule => typeof rule === 'string' ? new RegExp(`^${rule}$`, 'i') : rule;

  const restoreCase = (word, token) => {
    if (word === token) return token;
    if (word === word.toLowerCase()) return token.toLowerCase();
    if (word === word.toUpperCase()) return token.toUpperCase();
    if (word[0] === word[0].toUpperCase()) return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
    return token.toLowerCase();
  };

  const interpolate = (str, args) => str.replace(/\$(\d{1,2})/g, (match, index) => args[index] || '');

  const replace = (word, rule) => word.replace(rule[0], (...args) => restoreCase(args[0] || word[args[1] - 1], interpolate(rule[1], args)));

  const sanitizeWord = (token, word, rules) => {
    if (!token.length || uncountables.has(token)) {
      return word;
    }
    for (let i = rules.length - 1; i >= 0; i--) {
      const rule = rules[i];
      if (rule[0].test(word)) return replace(word, rule);
    }
    return word;
  };

  const replaceWord = (replaceMap, keepMap, rules) => word => {
    const token = word.toLowerCase();
    if (keepMap.has(token)) return restoreCase(word, token);
    if (replaceMap.has(token)) return restoreCase(word, replaceMap.get(token));
    return sanitizeWord(token, word, rules);
  };

  const checkWord = (replaceMap, keepMap, rules, bool) => word => {
    const token = word.toLowerCase();
    if (keepMap.has(token)) return true;
    if (replaceMap.has(token)) return false;
    return sanitizeWord(token, token, rules) === token;
  };

  const pluralize = (word, count, inclusive) => {
    const pluralized = count === 1 ? pluralize.singular(word) : pluralize.plural(word);
    return (inclusive ? `${count} ` : '') + pluralized;
  };

  pluralize.plural = replaceWord(irregularSingles, irregularPlurals, pluralRules);
  pluralize.isPlural = checkWord(irregularSingles, irregularPlurals, pluralRules);
  pluralize.singular = replaceWord(irregularPlurals, irregularSingles, singularRules);
  pluralize.isSingular = checkWord(irregularPlurals, irregularSingles, singularRules);

  pluralize.addPluralRule = (rule, replacement) => pluralRules.push([sanitizeRule(rule), replacement]);
  pluralize.addSingularRule = (rule, replacement) => singularRules.push([sanitizeRule(rule), replacement]);

  pluralize.addUncountableRule = word => {
    if (typeof word === 'string') {
      uncountables.add(word.toLowerCase());
    } else {
      pluralize.addPluralRule(word, '$0');
      pluralize.addSingularRule(word, '$0');
    }
  };

  pluralize.addIrregularRule = (single, plural) => {
    irregularSingles.set(single.toLowerCase(), plural.toLowerCase());
    irregularPlurals.set(plural.toLowerCase(), single.toLowerCase());
  };

  [
    ['I', 'we'], ['me', 'us'], ['he', 'they'], ['she', 'they'], ['them', 'them'],
    ['myself', 'ourselves'], ['yourself', 'yourselves'], ['itself', 'themselves'], ['herself', 'themselves'],
    ['himself', 'themselves'], ['themself', 'themselves'], ['is', 'are'], ['was', 'were'], ['has', 'have'],
    ['this', 'these'], ['that', 'those'], ['echo', 'echoes'], ['dingo', 'dingoes'], ['volcano', 'volcanoes'],
    ['tornado', 'tornadoes'], ['torpedo', 'torpedoes'], ['genus', 'genera'], ['viscus', 'viscera'],
    ['stigma', 'stigmata'], ['stoma', 'stomata'], ['dogma', 'dogmata'], ['lemma', 'lemmata'], ['schema', 'schemata'],
    ['anathema', 'anathemata'], ['ox', 'oxen'], ['axe', 'axes'], ['die', 'dice'], ['yes', 'yeses'], ['foot', 'feet'],
    ['eave', 'eaves'], ['goose', 'geese'], ['tooth', 'teeth'], ['quiz', 'quizzes'], ['human', 'humans'],
    ['proof', 'proofs'], ['carve', 'carves'], ['valve', 'valves'], ['looey', 'looies'], ['thief', 'thieves'],
    ['groove', 'grooves'], ['pickaxe', 'pickaxes'], ['passerby', 'passersby']
  ].forEach(([single, plural]) => pluralize.addIrregularRule(single, plural));

  [
    [/s?$/i, 's'], [/[^\u0000-\u007F]$/i, '$0'], [/([^aeiou]ese)$/i, '$1'], [/(ax|test)is$/i, '$1es'],
    [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'], [/(e[mn]u)s?$/i, '$1s'],
    [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1'], [
      /(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'
    ], [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'], [/(seraph|cherub)(?:im)?$/i, '$1im'],
    [/(her|at|gr)o$/i, '$1oes'], [
      /(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a'
    ], [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'],
    [/sis$/i, 'ses'], [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'], [/([^aeiouy]|qu)y$/i, '$1ies'],
    [/([^ch][ieo][ln])ey$/i, '$1ies'], [/(x|ch|ss|sh|zz)$/i, '$1es'],
    [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'], [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'],
    [/(pe)(?:rson|ople)$/i, '$1ople'], [/(child)(?:ren)?$/i, '$1ren'], [/eaux$/i, '$0'], [/m[ae]n$/i, 'men'],
    ['thou', 'you']
  ].forEach(([rule, replacement]) => pluralize.addPluralRule(rule, replacement));

  [
    [/s$/i, ''], [/(ss)$/i, '$1'], [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
    [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'], [/ies$/i, 'y'],
    [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, '$1ie'],
    [/\b(mon|smil)ies$/i, '$1ey'], [/\b((?:tit)?m|l)ice$/i, '$1ouse'],
    [/(seraph|cherub)im$/i, '$1'], [
      /(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, '$1'
    ], [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, '$1sis'],
    [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'], [/(test)(?:is|es)$/i, '$1is'],
    [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'],
    [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, '$1um'],
    [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'],
    [/(alumn|alg|vertebr)ae$/i, '$1a'], [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'],
    [/(matr|append)ices$/i, '$1ix'], [/(pe)(rson|ople)$/i, '$1rson'], [/(child)ren$/i, '$1'],
    [/(eau)x?$/i, '$1'], [/men$/i, 'man']
  ].forEach(([rule, replacement]) => pluralize.addSingularRule(rule, replacement));

  [
    'adulthood', 'advice', 'agenda', 'aid', 'aircraft', 'alcohol', 'ammo', 'analytics', 'anime', 'athletics',
    'audio', 'bison', 'blood', 'bream', 'buffalo', 'butter', 'carp', 'cash', 'chassis', 'chess', 'clothing', 'cod',
    'commerce', 'cooperation', 'corps', 'debris', 'diabetes', 'digestion', 'elk', 'energy', 'equipment', 'excretion',
    'expertise', 'firmware', 'flounder', 'fun', 'gallows', 'garbage', 'graffiti', 'hardware', 'headquarters',
    'health', 'herpes', 'highjinks', 'homework', 'housework', 'information', 'jeans', 'justice', 'kudos', 'labour',
    'literature', 'machinery', 'mackerel', 'mail', 'media', 'mews', 'moose', 'music', 'mud', 'manga', 'news', 'only',
    'personnel', 'pike', 'plankton', 'pliers', 'police', 'pollution', 'premises', 'rain', 'research', 'rice', 'salmon',
    'scissors', 'series', 'sewage', 'shambles', 'shrimp', 'software', 'species', 'staff', 'swine', 'tennis', 'traffic',
    'transportation', 'trout', 'tuna', 'wealth', 'welfare', 'whiting', 'wildebeest', 'wildlife', 'you',
    /pok[eé]mon$/i, /[^aeiou]ese$/i, /deer$/i, /fish$/i, /measles$/i, /o[iu]s$/i, /pox$/i, /sheep$/i
  ].forEach(word => pluralize.addUncountableRule(word));

  return pluralize;
});
