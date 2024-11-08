'use strict';

const AtRule = require('./at-rule');
const Comment = require('./comment');
const Container = require('./container');
const CssSyntaxError = require('./css-syntax-error');
const Declaration = require('./declaration');
const Document = require('./document');
const fromJSON = require('./fromJSON');
const Input = require('./input');
const LazyResult = require('./lazy-result');
const list = require('./list');
const Node = require('./node');
const parse = require('./parse');
const Processor = require('./processor');
const Result = require('./result.js');
const Root = require('./root');
const Rule = require('./rule');
const stringify = require('./stringify');
const Warning = require('./warning');

function postcss(...plugins) {
  if (plugins.length === 1 && Array.isArray(plugins[0])) {
    plugins = plugins[0];
  }
  return new Processor(plugins);
}

postcss.plugin = function plugin(name, initializer) {
  let warningPrinted = false;
  function creator(...args) {
    if (console && console.warn && !warningPrinted) {
      warningPrinted = true;
      console.warn(
        `${name}: postcss.plugin was deprecated. Migration guide:\n` +
        'https://evilmartians.com/chronicles/postcss-8-plugin-migration'
      );
      if (process.env.LANG && process.env.LANG.startsWith('cn')) {
        console.warn(
          `${name}: 里面 postcss.plugin 被弃用. 迁移指南:\n` +
          'https://www.w3ctech.com/topic/2226'
        );
      }
    }
    const transformer = initializer(...args);
    transformer.postcssPlugin = name;
    transformer.postcssVersion = new Processor().version;
    return transformer;
  }

  let cache;
  Object.defineProperty(creator, 'postcss', {
    get() {
      if (!cache) cache = creator();
      return cache;
    }
  });

  creator.process = function (css, processOpts, pluginOpts) {
    return postcss([creator(pluginOpts)]).process(css, processOpts);
  };

  return creator;
};

postcss.stringify = stringify;
postcss.parse = parse;
postcss.fromJSON = fromJSON;
postcss.list = list;

postcss.comment = defaults => new Comment(defaults);
postcss.atRule = defaults => new AtRule(defaults);
postcss.decl = defaults => new Declaration(defaults);
postcss.rule = defaults => new Rule(defaults);
postcss.root = defaults => new Root(defaults);
postcss.document = defaults => new Document(defaults);

postcss.CssSyntaxError = CssSyntaxError;
postcss.Declaration = Declaration;
postcss.Container = Container;
postcss.Processor = Processor;
postcss.Document = Document;
postcss.Comment = Comment;
postcss.Warning = Warning;
postcss.AtRule = AtRule;
postcss.Result = Result;
postcss.Input = Input;
postcss.Rule = Rule;
postcss.Root = Root;
postcss.Node = Node;

LazyResult.registerPostcss(postcss);

module.exports = postcss;
postcss.default = postcss;
