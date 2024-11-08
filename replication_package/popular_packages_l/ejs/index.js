markdown
const fs = require('fs');
const path = require('path');

class EJS {
  constructor() {
    this.cache = new Map();
    this.delimiter = '%';
    this.openDelimiter = '<';
    this.closeDelimiter = '>';
  }

  compile(str, options = {}) {
    let delimiter = options.delimiter || this.delimiter;
    let open = options.openDelimiter || this.openDelimiter;
    let close = options.closeDelimiter || this.closeDelimiter;

    let regex = new RegExp(`${open}${delimiter}(.*?)${delimiter}${close}`, 'g');

    let compiled = str.replace(regex, (_, code) => {
      let escapeCode = code.trim().startsWith('=') ? 'echo(' : code.trim().startsWith('-') ? 'unescape(' : '';
      code = escapeCode ? code.trim().slice(1).trim() : code.trim();
      return escapeCode ? `\${${escapeCode}${code})}` : `; ${code}; __output += \``;
    });

    let renderFunc = new Function('data', 'echo', 'unescape', `
      let __output = '';
      with(data || {}) {
        __output += \`${compiled}\`;
      }
      return __output;
    `);
    return renderFunc;
  }

  render(str, data, options) {
    let template = this.compile(str, options);
    return template(data, data => data, data => data);
  }

  renderFile(filename, data, options = {}, callback) {
    fs.readFile(filename, 'utf8', (err, content) => {
      if (err) return callback(err);
      try {
        let result = this.render(content, data, options);
        callback(null, result);
      } catch (e) {
        callback(e);
      }
    });
  }

  renderFileSync(filename, data, options = {}) {
    let content = fs.readFileSync(filename, 'utf8');
    return this.render(content, data, options);
  }

  include(filePath, data) {
    let templatePath = path.resolve(filePath);
    if (this.cache.has(templatePath)) {
      return this.cache.get(templatePath)(data);
    }
    let content = fs.readFileSync(templatePath, 'utf8');
    let renderTemplate = this.compile(content);
    this.cache.set(templatePath, renderTemplate);
    return renderTemplate(data);
  }
}

module.exports = new EJS();
