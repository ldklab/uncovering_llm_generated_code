// Import the required static methods for DOM manipulation
const staticMethods = require('./lib/static');

// Main export for supporting Cheerio functionality
const cheerio = module.exports = require('./lib/cheerio');

// Export Cheerio library version info from package.json
cheerio.version = require('./package.json').version;

// Attach static methods to the main export for consistency with the jQuery library
cheerio.load = staticMethods.load;
cheerio.html = staticMethods.html;
cheerio.text = staticMethods.text;
cheerio.xml = staticMethods.xml;

// Deprecated methods for backward compatibility, encouraging users to use static methods instead
/**
 * Determine if an element is a descendant of another
 * @deprecated
 */
cheerio.contains = staticMethods.contains;

/**
 * Merge two arrays, similar to jQuery's merge method
 * @deprecated
 */
cheerio.merge = staticMethods.merge;

/**
 * Parse a string into an array of DOM nodes
 * @deprecated See {@link static/parseHTML}
 */
cheerio.parseHTML = staticMethods.parseHTML;

/**
 * Get the root element of a parsed document
 * @deprecated
 */
cheerio.root = staticMethods.root;
