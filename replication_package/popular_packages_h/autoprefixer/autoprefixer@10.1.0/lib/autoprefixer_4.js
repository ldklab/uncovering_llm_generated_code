const browserslist = require('browserslist');
const { agents } = require('caniuse-lite');
const colorette = require('colorette');

const Browsers = require('./browsers');
const Prefixes = require('./prefixes');
const data = require('../data/prefixes');
const info = require('./info');

const WARNING = `
  Replace Autoprefixer 'browsers' option to Browserslist config.
  Use 'browserslist' key in 'package.json' or '.browserslistrc' file.

  Using 'browsers' option can cause errors. Browserslist config can
  be used for Babel, Autoprefixer, postcss-normalize, and other tools.

  If you really need to use option, rename it to 'overrideBrowserslist'.

  Learn more at:
  https://github.com/browserslist/browserslist#readme
  https://twitter.com/browserslist
`;

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

const cache = new Map();

function timeCapsule(result, prefixes) {
  if (prefixes.browsers.selected.length === 0 ||
      prefixes.add.selectors.length > 0 ||
      Object.keys(prefixes.add).length > 2) return;

  /* istanbul ignore next */
  result.warn(
    'Greetings, time traveller. We are in the golden age of prefix-less CSS, where Autoprefixer is no longer needed for your stylesheet.'
  );
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

  options = options || {};

  if (options.browser) throw new Error('Change `browser` option to `overrideBrowserslist` in Autoprefixer');
  if (options.browserslist) throw new Error('Change `browserslist` option to `overrideBrowserslist` in Autoprefixer');

  if (options.overrideBrowserslist) {
    reqs = options.overrideBrowserslist;
  } else if (options.browsers) {
    if (console?.warn) {
      if (colorette.red) {
        console.warn(colorette.red(WARNING.replace(/`[^`]+`/g, i => colorette.yellow(i.slice(1, -1)))));
      } else {
        console.warn(WARNING);
      }
    }
    reqs = options.browsers;
  }

  const brwlstOpts = {
    ignoreUnknownVersions: options.ignoreUnknownVersions,
    stats: options.stats,
    env: options.env
  };

  function loadPrefixes(opts) {
    const d = module.exports.data;
    const browsers = new Browsers(d.browsers, reqs, opts, brwlstOpts);
    const key = `${browsers.selected.join(', ')}${JSON.stringify(options)}`;

    if (!cache.has(key)) {
      cache.set(key, new Prefixes(d.prefixes, browsers, options));
    }

    return cache.get(key);
  }

  return {
    postcssPlugin: 'autoprefixer',

    prepare(result) {
      const prefixes = loadPrefixes({
        from: result.opts.from,
        env: options.env
      });

      return {
        Once(root) {
          timeCapsule(result, prefixes);
          if (options.remove !== false) {
            prefixes.processor.remove(root, result);
          }
          if (options.add !== false) {
            prefixes.processor.add(root, result);
          }
        }
      };
    },

    info(opts) {
      opts = opts || {};
      opts.from = opts.from || process.cwd();
      return info(loadPrefixes(opts));
    },

    options,
    browsers: reqs
  };
};

module.exports.postcss = true;
module.exports.data = { browsers: agents, prefixes: data };
module.exports.defaults = browserslist.defaults;
module.exports.info = () => module.exports().info();