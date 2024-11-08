// Import the static methods from the ./lib/static module
const staticMethods = require('./lib/static');

// Main module exports, importing the core cheerio functionality
const cheerio = (module.exports = require('./lib/cheerio'));

// Export the version of Cheerio by reading the version from package.json
cheerio.version = require('./package.json').version;

// Attach the static methods directly to the cheerio export
cheerio.load = staticMethods.load;
cheerio.html = staticMethods.html;
cheerio.text = staticMethods.text;
cheerio.xml = staticMethods.xml;

/**
 * Deprecated: Users are encouraged to use the static method `contains` instead.
 * Checks if a DOM element contains another DOM element.
 *
 * @example
 * const $ = cheerio.load('<div><p></p></div>');
 * $.contains($('div').get(0), $('p').get(0)); // true
 * $.contains($('p').get(0), $('div').get(0)); // false
 */
cheerio.contains = staticMethods.contains;

/**
 * Deprecated: Users are encouraged to use the static method `merge` instead.
 * Merges two arrays into a single array.
 *
 * @example
 * const $ = cheerio.load('');
 * $.merge([1, 2], [3, 4]); // [1, 2, 3, 4]
 */
cheerio.merge = staticMethods.merge;

/**
 * Deprecated: Users are encouraged to use the static method `parseHTML` instead.
 * Parses a string into HTML nodes.
 *
 * @example
 * const $ = cheerio.load('');
 * $.parseHTML('<b>markup</b>');
 */
cheerio.parseHTML = staticMethods.parseHTML;

/**
 * Deprecated: Users are encouraged to use the static method `root` instead.
 * Retrieves the root element of a Cheerio object.
 *
 * @example
 * const $ = cheerio.load('');
 * $.root();
 */
cheerio.root = staticMethods.root;
