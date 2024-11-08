const browserslist = require('browserslist');
const { agents } = require('caniuse-lite/dist/unpacker/agents');
const pico = require('picocolors');

const Browsers = require('./browsers');
const Prefixes = require('./prefixes');
const dataPrefixes = require('../data/prefixes');
const getInfo = require('./info');

const autoprefixerData = { browsers: agents, prefixes: dataPrefixes };

const WARNING = `
  Replace Autoprefixer \`browsers\` option to Browserslist config.
  Use \`browserslist\` key in \`package.json\` or \`.browserslistrc\` file.

  Using \`browsers\` option can cause errors. Browserslist config can
  be used for Babel, Autoprefixer, postcss-normalize and other tools.

  If you really need to use option, rename it to \`overrideBrowserslist\`.

  Learn more at:
  https://github.com/browserslist/browserslist#readme
  https://twitter.com/browserslist
`;

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

let cache = new Map();

function timeCapsule(result, prefixes) {
  if (prefixes.browsers.selected.length === 0 || 
      prefixes.add.selectors.length > 0 || 
      Object.keys(prefixes.add).length > 2) {
    return;
  }
  /* c8 ignore next 11 */
  result.warn(
    'Autoprefixer target browsers do not need any prefixes. You do not need Autoprefixer anymore.\n' +
    'Check your Browserslist config to be sure that your targets are set up correctly.\n\n' +
    'Learn more at:\n' +
    'https://github.com/postcss/autoprefixer#readme\n' +
    'https://github.com/browserslist/browserslist#readme\n'
  );
}

module.exports = function plugin(...reqs) {
  let options = {};
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

  if (options.browser) {
    throw new Error('Change `browser` option to `overrideBrowserslist` in Autoprefixer');
  } else if (options.browserslist) {
    throw new Error('Change `browserslist` option to `overrideBrowserslist` in Autoprefixer');
  }

  if (options.overrideBrowserslist) {
    reqs = options.overrideBrowserslist;
  } else if (options.browsers) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(pico.red(WARNING.replace(/`[^`]+`/g, i => pico.yellow(i.slice(1, -1)))));
    }
    reqs = options.browsers;
  }

  const brwlstOpts = {
    env: options.env,
    ignoreUnknownVersions: options.ignoreUnknownVersions,
    stats: options.stats
  };

  function loadPrefixes(opts) {
    const d = autoprefixerData;
    const browsers = new Browsers(d.browsers, reqs, opts, brwlstOpts);
    const key = browsers.selected.join(', ') + JSON.stringify(options);

    if (!cache.has(key)) {
      cache.set(key, new Prefixes(d.prefixes, browsers, options));
    }

    return cache.get(key);
  }

  return {
    browsers: reqs,

    info(opts = {}) {
      opts.from = opts.from || process.cwd();
      return getInfo(loadPrefixes(opts));
    },

    options,

    postcssPlugin: 'autoprefixer',

    prepare(result) {
      const prefixes = loadPrefixes({ env: options.env, from: result.opts.from });

      return {
        OnceExit(root) {
          timeCapsule(result, prefixes);
          if (options.remove !== false) {
            prefixes.processor.remove(root, result);
          }
          if (options.add !== false) {
            prefixes.processor.add(root, result);
          }
        }
      };
    }
  };
};

module.exports.postcss = true;
module.exports.data = autoprefixerData;
module.exports.defaults = browserslist.defaults;
module.exports.info = () => module.exports().info();
