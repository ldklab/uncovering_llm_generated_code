var cheerioStaticMethods = require('./lib/static');
var cheerio = require('./lib/cheerio');

cheerio.version = require('./package.json').version;

cheerio.load = cheerioStaticMethods.load;
cheerio.html = cheerioStaticMethods.html;
cheerio.text = cheerioStaticMethods.text;
cheerio.xml = cheerioStaticMethods.xml;

// Deprecated methods
cheerio.contains = cheerioStaticMethods.contains;
cheerio.merge = cheerioStaticMethods.merge;
cheerio.parseHTML = cheerioStaticMethods.parseHTML;
cheerio.root = cheerioStaticMethods.root;

module.exports = cheerio;
