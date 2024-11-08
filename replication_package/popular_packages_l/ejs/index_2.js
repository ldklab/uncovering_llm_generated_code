const fs = require('fs');
const path = require('path');

class EJS {
  constructor() {
    this.cache = new Map();
    this.delimiter = '%';
    this.openDelimiter = '<';
    this.closeDelimiter = '>';
  }

  compile(template, options = {}) {
    const delimiter = options.delimiter || this.delimiter;
    const open = options.openDelimiter || this.openDelimiter;
    const close = options.closeDelimiter || this.closeDelimiter;
    const pattern = new RegExp(`${open}${delimiter}(.*?)${delimiter}${close}`, 'g');

    const compiledTemplate = template.replace(pattern, (_, code) => {
      code = code.trim();
      let prefix = '';
      if (code.startsWith('=')) {
        prefix = 'echo(';
        code = code.slice(1);
      } else if (code.startsWith('-')) {
        prefix = 'unescape(';
        code = code.slice(1);
      }
      return prefix ? `\${${prefix}${code.trim()})}` : `; ${code}; __output += \``;
    });

    return new Function('data', 'echo', 'unescape', `
      let __output = '';
      with(data || {}) {
        __output += \`${compiledTemplate}\`;
      }
      return __output;
    `);
  }

  render(template, data, options) {
    const renderFunction = this.compile(template, options);
    return renderFunction(data, (str) => str, (str) => str);
  }

  renderFile(filename, data, options = {}, callback) {
    fs.readFile(filename, 'utf8', (error, content) => {
      if (error) return callback(error);
      try {
        const output = this.render(content, data, options);
        callback(null, output);
      } catch (err) {
        callback(err);
      }
    });
  }

  renderFileSync(filename, data, options = {}) {
    const content = fs.readFileSync(filename, 'utf8');
    return this.render(content, data, options);
  }

  include(filepath, data) {
    const fullPath = path.resolve(filepath);
    if (this.cache.has(fullPath)) {
      return this.cache.get(fullPath)(data);
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    const templateFunc = this.compile(content);
    this.cache.set(fullPath, templateFunc);
    return templateFunc(data);
  }
}

module.exports = new EJS();
