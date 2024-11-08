const browserslist = require('browserslist');
const { agents } = require('caniuse-lite');
const colorette = require('colorette');

const Browsers = require('./browsers');
const Prefixes = require('./prefixes');
const data = require('../data/prefixes');
const info = require('./info');

const WARNING_MESSAGE = `
  Replace Autoprefixer 'browsers' option with Browserslist config.
  Use 'browserslist' key in 'package.json' or '.browserslistrc' file.

  Using 'browsers' option can cause errors. Browserslist config can
  be used for Babel, Autoprefixer, postcss-normalize, and other tools.

  If you really need to use the option, rename it to 'overrideBrowserslist'.

  Learn more at:
  https://github.com/browserslist/browserslist#readme
  https://twitter.com/browserslist
`;

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

const cache = new Map();

function warnTimeTraveler(result, prefixes) {
  if (prefixes.browsers.selected.length === 0 || prefixes.add.selectors.length > 0 || Object.keys(prefixes.add).length > 2) {
    return;
  }
  result.warn('Greetings, time traveller. We are in the golden age of prefix-less CSS, where Autoprefixer is no longer needed for your stylesheet.');
}

module.exports = (...reqs) => {
  let options;

  if (reqs.length === 1 && isPlainObject(reqs[0])) {
    options = reqs[0];
    reqs = undefined;
  } else if (reqs.length === 0 || (reqs.length === 1 && !reqs[0])) {
    reqs = undefined;
  } else if (reqs.length <= 2 && (Array.isArray(reqs[0]) || !reqs[0])) {
    options = reqs[1];
    reqs = reqs[0];
  } else if (typeof reqs[reqs.length - 1] === 'object') {
    options = reqs.pop();
  }

  if (!options) options = {};

  if (options.browser) {
    throw new Error('Change `browser` option to `overrideBrowserslist` in Autoprefixer');
  } else if (options.browserslist) {
    throw new Error('Change `browserslist` option to `overrideBrowserslist` in Autoprefixer');
  }

  if (options.overrideBrowserslist) {
    reqs = options.overrideBrowserslist;
  } else if (options.browsers) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(colorette.red(WARNING_MESSAGE.replace(/`[^`]+`/g, i => colorette.yellow(i.slice(1, -1)))));
    }
    reqs = options.browsers;
  }

  const browserListOptions = {
    ignoreUnknownVersions: options.ignoreUnknownVersions,
    stats: options.stats,
    env: options.env
  };

  function loadPrefixes(loadOptions) {
    const prefixData = module.exports.data;
    const browsers = new Browsers(prefixData.browsers, reqs, loadOptions, browserListOptions);
    const cacheKey = browsers.selected.join(', ') + JSON.stringify(options);

    if (!cache.has(cacheKey)) {
      cache.set(cacheKey, new Prefixes(prefixData.prefixes, browsers, options));
    }

    return cache.get(cacheKey);
  }

  return {
    postcssPlugin: 'autoprefixer',
    
    prepare(result) {
      const prefixes = loadPrefixes({ from: result.opts.from, env: options.env });

      return {
        Once(root) {
          warnTimeTraveler(result, prefixes);
          if (options.remove !== false) {
            prefixes.processor.remove(root, result);
          }
          if (options.add !== false) {
            prefixes.processor.add(root, result);
          }
        }
      };
    },

    info(inputOptions = {}) {
      inputOptions.from = inputOptions.from || process.cwd();
      return info(loadPrefixes(inputOptions));
    },

    options,
    browsers: reqs
  };
};

module.exports.postcss = true;

module.exports.data = { browsers: agents, prefixes: data };
module.exports.defaults = browserslist.defaults;
module.exports.info = () => module.exports().info();
