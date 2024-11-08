'use strict';

const { generate } = require('regjsgen');
const { parse } = require('regjsparser');
const regenerate = require('regenerate');
const unicodeMatchProperty = require('unicode-match-property-ecmascript');
const unicodeMatchPropertyValue = require('unicode-match-property-value-ecmascript');
const iuMappings = require('./data/iu-mappings.js');
const ESCAPE_SETS = require('./data/character-class-escape-sets.js');

const UNICODE_SET = regenerate().addRange(0x0, 0x10FFFF);
const BMP_SET = regenerate().addRange(0x0, 0xFFFF);
const DOT_SET_UNICODE = UNICODE_SET.clone().remove(0x000A, 0x000D, 0x2028, 0x2029);

const getCharacterClassEscapeSet = (char, unicode, ignoreCase) => {
  if (unicode) {
    return ignoreCase ? ESCAPE_SETS.UNICODE_IGNORE_CASE.get(char) : ESCAPE_SETS.UNICODE.get(char);
  }
  return ESCAPE_SETS.REGULAR.get(char);
};

const getUnicodeDotSet = (dotAll) => (dotAll ? UNICODE_SET : DOT_SET_UNICODE);

const getUnicodePropertyValueSet = (property, value) => {
  const path = value ? `${property}/${value}` : `Binary_Property/${property}`;
  try {
    return require(`regenerate-unicode-properties/${path}.js`);
  } catch {
    throw new Error(`Failed to recognize value \`${value}\` for property \`${property}\`.`);
  }
};

const handleLoneUnicodePropertyNameOrValue = (value) => {
  try {
    const property = 'General_Category';
    const category = unicodeMatchPropertyValue(property, value);
    return getUnicodePropertyValueSet(property, category);
  } catch {}
  const property = unicodeMatchProperty(value);
  return getUnicodePropertyValueSet(property);
};

const getUnicodePropertyEscapeSet = (value, isNegative) => {
  const parts = value.split('=');
  let set;
  if (parts.length === 1) {
    set = handleLoneUnicodePropertyNameOrValue(parts[0]);
  } else {
    const property = unicodeMatchProperty(parts[0]);
    const val = unicodeMatchPropertyValue(property, parts[1]);
    set = getUnicodePropertyValueSet(property, val);
  }
  return isNegative ? UNICODE_SET.clone().remove(set) : set.clone();
};

regenerate.prototype.iuAddRange = function (min, max) {
  for (; min <= max; min++) {
    const folded = caseFold(min);
    if (folded) this.add(folded);
  }
  return this;
};

const update = (item, pattern) => {
  let tree = parse(pattern, config.useUnicodeFlag ? 'u' : '');
  if (!['characterClass', 'group', 'value'].includes(tree.type)) {
    tree = wrap(tree, pattern);
  }
  Object.assign(item, tree);
};

const wrap = (tree, pattern) => ({
  type: 'group',
  behavior: 'ignore',
  body: [tree],
  raw: `(?:${pattern})`,
});

const caseFold = (codePoint) => iuMappings.get(codePoint) || false;

const processCharacterClass = (characterClassItem, regenerateOptions) => {
  const set = regenerate();
  for (const item of characterClassItem.body) {
    switch (item.type) {
      case 'value':
        set.add(item.codePoint);
        if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
          const folded = caseFold(item.codePoint);
          if (folded) set.add(folded);
        }
        break;
      case 'characterClassRange':
        const { min, max } = item;
        set.addRange(min.codePoint, max.codePoint);
        if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
          set.iuAddRange(min.codePoint, max.codePoint);
        }
        break;
      case 'characterClassEscape':
        set.add(getCharacterClassEscapeSet(item.value, config.unicode, config.ignoreCase));
        break;
      case 'unicodePropertyEscape':
        set.add(getUnicodePropertyEscapeSet(item.value, item.negative));
        break;
      default:
        throw new Error(`Unknown term type: ${item.type}`);
    }
  }
  if (characterClassItem.negative) {
    update(characterClassItem, `(?!${set.toString(regenerateOptions)})[\\s\\S]`);
  } else {
    update(characterClassItem, set.toString(regenerateOptions));
  }
  return characterClassItem;
};

const updateNamedReference = (item, index) => {
  delete item.name;
  item.matchIndex = index;
};

const assertNoUnmatchedReferences = (groups) => {
  const unmatchedNames = Object.keys(groups.unmatchedReferences);
  if (unmatchedNames.length) {
    throw new Error(`Unknown group names: ${unmatchedNames}`);
  }
};

const processTerm = (item, regenerateOptions, groups) => {
  switch (item.type) {
    case 'dot':
      if (!config.useDotAllFlag && config.unicode) {
        update(item, getUnicodeDotSet(config.dotAll).toString(regenerateOptions));
      } else if (config.dotAll) {
        update(item, '[\\s\\S]');
      }
      break;
    case 'characterClass':
      item = processCharacterClass(item, regenerateOptions);
      break;
    case 'unicodePropertyEscape':
      if (config.unicodePropertyEscape) {
        update(item, getUnicodePropertyEscapeSet(item.value, item.negative).toString(regenerateOptions));
      }
      break;
    case 'characterClassEscape':
      update(item, getCharacterClassEscapeSet(item.value, config.unicode, config.ignoreCase).toString(regenerateOptions));
      break;
    case 'group':
      if (item.behavior === 'normal') groups.lastIndex++;
      if (item.name && config.namedGroup) {
        const name = item.name.value;
        if (groups.names[name]) {
          throw new Error(`Multiple groups with the same name (${name}) are not allowed.`);
        }
        const index = groups.lastIndex;
        groups.names[name] = index;
        if (groups.onNamedGroup) groups.onNamedGroup(name, index);
        if (groups.unmatchedReferences[name]) {
          groups.unmatchedReferences[name].forEach(reference => updateNamedReference(reference, index));
          delete groups.unmatchedReferences[name];
        }
      }
    case 'alternative':
    case 'disjunction':
    case 'quantifier':
      item.body = item.body.map(term => processTerm(term, regenerateOptions, groups));
      break;
    case 'value':
      const set = regenerate(item.codePoint);
      if (config.ignoreCase && config.unicode && !config.useUnicodeFlag) {
        const folded = caseFold(item.codePoint);
        if (folded) set.add(folded);
      }
      update(item, set.toString(regenerateOptions));
      break;
    case 'reference':
      if (item.name) {
        const name = item.name.value;
        const index = groups.names[name];
        if (index) {
          updateNamedReference(item, index);
        } else {
          if (!groups.unmatchedReferences[name]) groups.unmatchedReferences[name] = [];
          groups.unmatchedReferences[name].push(item);
        }
      }
      break;
    case 'anchor':
    case 'empty':
    case 'group':
      break;
    default:
      throw new Error(`Unknown term type: ${item.type}`);
  }
  return item;
};

const config = {
  ignoreCase: false,
  unicode: false,
  dotAll: false,
  useDotAllFlag: false,
  useUnicodeFlag: false,
  unicodePropertyEscape: false,
  namedGroup: false,
};

const rewritePattern = (pattern, flags, options) => {
  config.unicode = flags && flags.includes('u');
  const regjsparserFeatures = {
    unicodePropertyEscape: config.unicode,
    namedGroups: true,
    lookbehind: options && options.lookbehind,
  };
  config.ignoreCase = flags && flags.includes('i');
  const supportDotAllFlag = options && options.dotAllFlag;
  config.dotAll = supportDotAllFlag && flags && flags.includes('s');
  config.namedGroup = options && options.namedGroup;
  config.useDotAllFlag = options && options.useDotAllFlag;
  config.useUnicodeFlag = options && options.useUnicodeFlag;
  config.unicodePropertyEscape = options && options.unicodePropertyEscape;
  if (supportDotAllFlag && config.useDotAllFlag) {
    throw new Error('`useDotAllFlag` and `dotAllFlag` cannot both be true!');
  }
  const regenerateOptions = {
    hasUnicodeFlag: config.useUnicodeFlag,
    bmpOnly: !config.unicode,
  };
  const groups = {
    onNamedGroup: options && options.onNamedGroup,
    lastIndex: 0,
    names: Object.create(null),
    unmatchedReferences: Object.create(null),
  };
  const tree = parse(pattern, flags, regjsparserFeatures);
  processTerm(tree, regenerateOptions, groups);
  assertNoUnmatchedReferences(groups);
  return generate(tree);
};

module.exports = rewritePattern;
