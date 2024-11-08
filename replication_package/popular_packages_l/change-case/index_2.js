// change-case/index.js
export const camelCase = (input, options = {}) => convertCase(input, "camel", options);
export const capitalCase = (input, options = {}) => convertCase(input, "capital", options);
export const constantCase = (input, options = {}) => convertCase(input, "constant", options);
export const dotCase = (input, options = {}) => convertCase(input, "dot", options);
export const kebabCase = (input, options = {}) => convertCase(input, "kebab", options);
export const noCase = (input, options = {}) => convertCase(input, "no", options);
export const pascalCase = (input, options = {}) => convertCase(input, "pascal", options);
export const pascalSnakeCase = (input, options = {}) => convertCase(input, "pascalSnake", options);
export const pathCase = (input, options = {}) => convertCase(input, "path", options);
export const sentenceCase = (input, options = {}) => convertCase(input, "sentence", options);
export const snakeCase = (input, options = {}) => convertCase(input, "snake", options);
export const trainCase = (input, options = {}) => convertCase(input, "train", options);

export function split(input) {
  return input.match(/[A-Za-z][a-z]*|[0-9]+/g) || [];
}

function convertCase(input, type, options) {
  const words = split(input);
  return words.map((word, index) => {
    if (type === "camel") return index === 0 ? word.toLowerCase() : capitalize(word);
    if (["capital", "pascal", "pascalSnake", "train"].includes(type)) return capitalize(word);
    if (type === "constant") return word.toUpperCase();
    if (type === "sentence") return index === 0 ? capitalize(word) : word.toLowerCase();
    return word.toLowerCase();
  }).join(delimiterForType(type, options));
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function delimiterForType(type, options) {
  const delimiters = {
    camel: '',
    capital: ' ',
    constant: '_',
    dot: '.',
    kebab: '-',
    no: ' ',
    pascal: '',
    pascalSnake: '_',
    path: '/',
    sentence: ' ',
    snake: '_',
    train: '-'
  };
  return options.delimiter || delimiters[type];
}

// change-case/keys.js
import * as changeCase from './index.js';

export const camelCase = (obj, depth = 1, options = {}) => transformKeys(obj, changeCase.camelCase, depth, options); 

function transformKeys(obj, transform, depth, options) {
  if (depth < 0 || typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transform, depth - 1, options));
  }
  return Object.keys(obj).reduce((acc, key) => {
    acc[transform(key, options)] = transformKeys(obj[key], transform, depth - 1, options);
    return acc;
  }, {});
}
