// Require static methods from the static library module
const staticMethods = require('./lib/static');

// Export the main Cheerio module from the cheerio library
module.exports = require('./lib/cheerio');

// Set export aliases for static methods as properties of module.exports
module.exports.load = staticMethods.load;
module.exports.html = staticMethods.html;
module.exports.text = staticMethods.text;
module.exports.xml = staticMethods.xml;

// Set the version of the current Cheerio module by accessing package.json
module.exports.version = require('./package.json').version;

// Provide deprecated methods and advice to use static counterparts 
module.exports.contains = staticMethods.contains; // Deprecated: Use static `contains` method instead
module.exports.merge = staticMethods.merge; // Deprecated: Use static `merge` method instead
module.exports.parseHTML = staticMethods.parseHTML; // Deprecated: Use static `parseHTML` method instead
module.exports.root = staticMethods.root; // Deprecated: Use static `root` method instead
