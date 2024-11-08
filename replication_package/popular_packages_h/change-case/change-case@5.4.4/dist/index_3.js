// Regular expressions for splitting words based on case transitions and non-word characters
const SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
const SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;
const SPLIT_SEPARATE_NUMBER_RE = /(\d)\p{Ll}|(\p{L})\d/u;
const DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;

// Replacement string for splitting delimiter
const SPLIT_REPLACE_VALUE = "$1\0$2";

// Default characters for string manipulation
const DEFAULT_PREFIX_SUFFIX_CHARACTERS = "";

/**
 * Split cased input strings into an array of words.
 */
export function split(value) {
    let result = value.trim();
    result = result
        .replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE)
        .replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE)
        .replace(DEFAULT_STRIP_REGEXP, "\0");

    let start = 0;
    let end = result.length;

    while (result.charAt(start) === "\0") start++;
    if (start === end) return [];
    while (result.charAt(end - 1) === "\0") end--;

    return result.slice(start, end).split(/\0/g);
}

/**
 * Split input string into words, separating numbers.
 */
export function splitSeparateNumbers(value) {
    const words = split(value);
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const match = SPLIT_SEPARATE_NUMBER_RE.exec(word);
        if (match) {
            const offset = match.index + (match[1] ?? match[2]).length;
            words.splice(i, 1, word.slice(0, offset), word.slice(offset));
        }
    }
    return words;
}

/**
 * Convert a string to space-separated lowercase.
 */
export function noCase(input, options) {
    return transformCase(input, options, words =>
        words.map(lowerFactory(options?.locale)).join(options?.delimiter ?? " ")
    );
}

/**
 * Convert a string to camel case.
 */
export function camelCase(input, options) {
    return transformCase(input, options, (words, lower, transform) =>
        words.map((word, index) => index === 0 ? lower(word) : transform(word, index))
            .join(options?.delimiter ?? "")
    );
}

/**
 * Convert a string to pascal case.
 */
export function pascalCase(input, options) {
    return transformCase(input, options, (words, _, transform) =>
        words.map(transform).join(options?.delimiter ?? "")
    );
}

/**
 * Convert a string to pascal snake case.
 */
export function pascalSnakeCase(input, options) {
    return capitalCase(input, { delimiter: "_", ...options });
}

/**
 * Convert a string to capital case.
 */
export function capitalCase(input, options) {
    return transformCase(input, options, (words, _, transform) =>
        words.map(transform).join(options?.delimiter ?? " ")
    );
}

/**
 * Convert a string to constant case.
 */
export function constantCase(input, options) {
    return transformCase(input, options, words =>
        words.map(upperFactory(options?.locale)).join(options?.delimiter ?? "_")
    );
}

/**
 * Convert a string to dot case.
 */
export function dotCase(input, options) {
    return noCase(input, { delimiter: ".", ...options });
}

/**
 * Convert a string to kebab case.
 */
export function kebabCase(input, options) {
    return noCase(input, { delimiter: "-", ...options });
}

/**
 * Convert a string to path case.
 */
export function pathCase(input, options) {
    return noCase(input, { delimiter: "/", ...options });
}

/**
 * Convert a string to sentence case.
 */
export function sentenceCase(input, options) {
    return transformCase(input, options, (words, lower, transform) =>
        words.map((word, index) => index === 0 ? transform(word) : lower(word))
            .join(options?.delimiter ?? " ")
    );
}

/**
 * Convert a string to snake case.
 */
export function snakeCase(input, options) {
    return noCase(input, { delimiter: "_", ...options });
}

/**
 * Convert a string to header case.
 */
export function trainCase(input, options) {
    return capitalCase(input, { delimiter: "-", ...options });
}

// Helper functions 

function transformCase(input, options, callback) {
    const [prefix, words, suffix] = splitPrefixSuffix(input, options);
    const lower = lowerFactory(options?.locale);
    const upper = upperFactory(options?.locale);
    const transform = options?.mergeAmbiguousCharacters
        ? capitalCaseTransformFactory(lower, upper)
        : pascalCaseTransformFactory(lower, upper);
    
    return prefix + callback(words, lower, transform) + suffix;
}

function lowerFactory(locale) {
    return locale === false
        ? (input) => input.toLowerCase()
        : (input) => input.toLocaleLowerCase(locale);
}

function upperFactory(locale) {
    return locale === false
        ? (input) => input.toUpperCase()
        : (input) => input.toLocaleUpperCase(locale);
}

function capitalCaseTransformFactory(lower, upper) {
    return (word) => `${upper(word[0])}${lower(word.slice(1))}`;
}

function pascalCaseTransformFactory(lower, upper) {
    return (word, index) => {
        const char0 = word[0];
        const initial = index > 0 && char0 >= "0" && char0 <= "9" ? "_" + char0 : upper(char0);
        return initial + lower(word.slice(1));
    };
}

function splitPrefixSuffix(input, options = {}) {
    const splitFn = options.split ?? (options.separateNumbers ? splitSeparateNumbers : split);
    const prefixCharacters = options.prefixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
    const suffixCharacters = options.suffixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  
    let prefixIndex = 0;
    let suffixIndex = input.length;
  
    while (prefixIndex < input.length) {
        const char = input.charAt(prefixIndex);
        if (!prefixCharacters.includes(char)) break;
        prefixIndex++;
    }
  
    while (suffixIndex > prefixIndex) {
        const index = suffixIndex - 1;
        const char = input.charAt(index);
        if (!suffixCharacters.includes(char)) break;
        suffixIndex = index;
    }
  
    return [
        input.slice(0, prefixIndex),
        splitFn(input.slice(prefixIndex, suffixIndex)),
        input.slice(suffixIndex),
    ];
}
