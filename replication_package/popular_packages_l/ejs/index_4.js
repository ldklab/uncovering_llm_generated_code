const fs = require('fs');
const path = require('path');

class TemplateEngine {
  constructor() {
    this.cache = new Map();
    this.defaultDelimiter = '%';
    this.openingTag = '<';
    this.closingTag = '>';
  }

  compile(templateString, options = {}) {
    const delimiter = options.delimiter || this.defaultDelimiter;
    const openTag = options.openDelimiter || this.openingTag;
    const closeTag = options.closeDelimiter || this.closingTag;
    const regex = new RegExp(`${openTag}${delimiter}(.*?)${delimiter}${closeTag}`, 'g');

    const compiledTemplate = templateString.replace(regex, (_, code) => {
      const trimmedCode = code.trim();
      const prepend = trimmedCode.startsWith('=') ? 'echo(' : trimmedCode.startsWith('-') ? 'unescape(' : '';
      const processCode = prepend ? trimmedCode.slice(1).trim() : trimmedCode;
      return prepend ? `\${${prepend}${processCode})}` : `; ${processCode}; __output += \``;
    });

    const renderFunction = new Function('context', 'echo', 'unescape', `
      let __output = '';
      with(context || {}) {
        __output += \`${compiledTemplate}\`;
      }
      return __output;
    `);
    return renderFunction;
  }

  render(templateString, context, options) {
    const templateFunction = this.compile(templateString, options);
    return templateFunction(context, data => data, data => data);
  }

  renderFile(filePath, context, options = {}, callback) {
    fs.readFile(filePath, 'utf8', (err, fileContent) => {
      if (err) return callback(err);
      try {
        const result = this.render(fileContent, context, options);
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    });
  }

  renderFileSync(filePath, context, options = {}) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return this.render(fileContent, context, options);
  }

  include(includeFilePath, context) {
    const resolvedPath = path.resolve(includeFilePath);
    if (this.cache.has(resolvedPath)) {
      return this.cache.get(resolvedPath)(context);
    }
    const fileContent = fs.readFileSync(resolvedPath, 'utf8');
    const compiledFunction = this.compile(fileContent);
    this.cache.set(resolvedPath, compiledFunction);
    return compiledFunction(context);
  }
}

module.exports = new TemplateEngine();
