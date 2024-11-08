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
    const regex = new RegExp(`${open}${delimiter}(.*?)${delimiter}${close}`, 'g');

    const transformedTemplate = template.replace(regex, (_, code) => {
      const trimmedCode = code.trim();
      const isEscaped = trimmedCode.startsWith('=');
      const isUnescaped = trimmedCode.startsWith('-');
      const renderExpression = isEscaped ? `echo(${trimmedCode.slice(1).trim()})` :
                          isUnescaped ? `unescape(${trimmedCode.slice(1).trim()})` :
                          trimmedCode;
      return `; ${renderExpression}; __output +=\``;
    });

    return new Function('data', 'echo', 'unescape', `
      let __output = '';
      with (data || {}) {
        __output += \`${transformedTemplate}\`;
      }
      return __output;
    `);
  }

  render(template, data, options) {
    const renderFn = this.compile(template, options);
    return renderFn(data, e => e, ue => ue);
  }

  renderFile(filePath, data, options = {}, callback) {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) return callback(err);
      try {
        const result = this.render(content, data, options);
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    });
  }

  renderFileSync(filePath, data, options = {}) {
    const content = fs.readFileSync(filePath, 'utf8');
    return this.render(content, data, options);
  }

  include(templatePath, data) {
    const absolutePath = path.resolve(templatePath);
    if (this.cache.has(absolutePath)) {
      return this.cache.get(absolutePath)(data);
    }
    const content = fs.readFileSync(absolutePath, 'utf8');
    const compiledTemplate = this.compile(content);
    this.cache.set(absolutePath, compiledTemplate);
    return compiledTemplate(data);
  }
}

module.exports = new EJS();
