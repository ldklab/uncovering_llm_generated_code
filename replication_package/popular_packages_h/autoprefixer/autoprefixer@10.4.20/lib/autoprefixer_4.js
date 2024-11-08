const browserslist = require('browserslist');
const { agents } = require('caniuse-lite/dist/unpacker/agents');
const pico = require('picocolors');

const Browsers = require('./browsers');
const Prefixes = require('./prefixes');
const dataPrefixes = require('../data/prefixes');
const getInfo = require('./info');

const autoprefixerData = { browsers: agents, prefixes: dataPrefixes };

const WARNING_MESSAGE = `
  Replace Autoprefixer \`browsers\` option with Browserslist config.
  Use \`browserslist\` key in \`package.json\` or \`.browserslistrc\` file.
  Using \`browsers\` option can cause errors. Switch to Browserslist config for compatibility with tools like Babel and postcss-normalize.
  Rename \`browsers\` option to \`overrideBrowserslist\` if necessary.
  
  Learn more at:
  https://github.com/browserslist/browserslist#readme
  https://twitter.com/browserslist
`;

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

let cache = new Map();

function timeCapsule(result, prefixes) {
  if (
    prefixes.browsers.selected.length === 0 ||
    prefixes.add.selectors.length > 0 ||
    Object.keys(prefixes.add).length > 2
  ) {
    return;
  }
  
  result.warn(`
    Autoprefixer target browsers do not need any prefixes. You may not need Autoprefixer anymore.
    Verify your Browserslist config is correct.
    
    Learn more at:
    https://github.com/postcss/autoprefixer#readme
    https://github.com/browserslist/browserslist#readme
  `);
}

module.exports = plugin;

function plugin(...reqs) {
  let options = {};

  // Determine `options` and `reqs` based on arguments provided
  if (reqs.length === 1 && isPlainObject(reqs[0])) {
    options = reqs[0];
    reqs = undefined;
  } else if (!reqs.length || (reqs.length === 1 && !reqs[0])) {
    reqs = undefined;
  } else if (reqs.length <= 2 && (Array.isArray(reqs[0]) || !reqs[0])) {
    options = reqs[1];
    reqs = reqs[0];
  } else if (typeof reqs[reqs.length - 1] === 'object') {
    options = reqs.pop();
  }

  // Handle deprecated or incorrect options
  if (options.browser || options.browserslist) {
    throw new Error('Use `overrideBrowserslist` instead of deprecated options in Autoprefixer');
  }

  if (options.overrideBrowserslist) {
    reqs = options.overrideBrowserslist;
  } else if (options.browsers && console && console.warn) {
    console.warn(pico.red(WARNING_MESSAGE.replace(/`[^`]+`/g, (i) => pico.yellow(i.slice(1, -1)))));
    reqs = options.browsers;
  }

  const brwlstOpts = {
    env: options.env,
    ignoreUnknownVersions: options.ignoreUnknownVersions,
    stats: options.stats,
  };

  function loadPrefixes(opts) {
    let d = autoprefixerData;
    let browsers = new Browsers(d.browsers, reqs, opts, brwlstOpts);
    let key = `${browsers.selected.join(', ')}${JSON.stringify(options)}`;

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
      const prefixes = loadPrefixes({
        env: options.env,
        from: result.opts.from,
      });

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
}

plugin.postcss = true;
plugin.data = autoprefixerData;
plugin.defaults = browserslist.defaults;
plugin.info = () => plugin().info();
