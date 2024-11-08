// File: markdown-it.js

const createMarkdownIt = () => {
  const state = {
    html: false,
    linkify: false,
    typographer: false,
    plugins: [],
    rules: {
      link: true,
      image: true,
    },
    quotes: '“”‘’',
  };

  const defaultOptions = {
    html: false,
    xhtmlOut: false,
    breaks: false,
    langPrefix: 'language-',
    linkify: false,
    typographer: false,
    quotes: '“”‘’',
    highlight: (str, lang) => '',
  };

  const init = (options = {}) => {
    Object.assign(state, { ...defaultOptions, ...options });
  };

  const render = (markdownText) => {
    let html = markdownText;
    if (state.linkify) {
      // Linkify logic can be implemented here
    }
    return html;
  };

  const renderInline = (markdownText) => render(markdownText);

  const use = (plugin, ...options) => {
    state.plugins.push({ plugin, options });
    plugin(exports, ...options);
    return exports;
  };

  const setRules = (rules = {}) => {
    Object.assign(state.rules, rules);
  };

  const enable = (rule) => {
    state.rules[rule] = true;
    return exports;
  };

  const disable = (rule) => {
    state.rules[rule] = false;
    return exports;
  };

  const exports = {
    init,
    render,
    renderInline,
    use,
    enable,
    disable,
    setRules,
  };

  return exports;
};

// Usage Example
const markdownIt = createMarkdownIt();
markdownIt.init({ linkify: true });
const result = markdownIt.render('# Hello Markdown-it!');

console.log(result);

export default createMarkdownIt;
