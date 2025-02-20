const fs = require('fs');
const path = require('path');

class EJS {
  constructor() {
    this.cache = new Map();
    this.delimiter = '%';
    this.openDelimiter = '<';
    this.closeDelimiter = '>';
  }

  compile(templateString, options = {}) {
    const delimiter = options.delimiter || this.delimiter;
    const openTag = options.openDelimiter || this.openDelimiter;
    const closeTag = options.closeDelimiter || this.closeDelimiter;

    const interpolationRegex = new RegExp(`${openTag}${delimiter}(.*?)${delimiter}${closeTag}`, 'g');

    const processedTemplate = templateString.replace(interpolationRegex, (_, capturedCode) => {
      const trimmedCode = capturedCode.trim();
      const isEscaped = trimmedCode.startsWith('=');
      const isUnescaped = trimmedCode.startsWith('-');
      
      let codeExpression = trimmedCode;
      let functionName = '';

      if (isEscaped) {
        functionName = 'echo';
        codeExpression = trimmedCode.slice(1).trim();
      } else if (isUnescaped) {
        functionName = 'unescape';
        codeExpression = trimmedCode.slice(1).trim();
      }

      return functionName 
        ? `\${${functionName}(${codeExpression})}` 
        : `; ${codeExpression}; __output += \``;
    });

    return new Function('data', 'echo', 'unescape', `
      let __output = '';
      with(data || {}) {
        __output += \`${processedTemplate}\`;
      }
      return __output;
    `);
  }

  render(templateString, data, options) {
    const compiledTemplate = this.compile(templateString, options);
    return compiledTemplate(data, output => output, output => output);
  }

  renderFile(filePath, data, options = {}, callback) {
    fs.readFile(filePath, 'utf8', (error, fileContent) => {
      if (error) return callback(error);
      
      try {
        const renderedOutput = this.render(fileContent, data, options);
        callback(null, renderedOutput);
      } catch (renderError) {
        callback(renderError);
      }
    });
  }

  renderFileSync(filePath, data, options = {}) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return this.render(fileContent, data, options);
  }

  include(filePath, data) {
    const resolvedPath = path.resolve(filePath);

    if (this.cache.has(resolvedPath)) {
      return this.cache.get(resolvedPath)(data);
    }

    const fileContent = fs.readFileSync(resolvedPath, 'utf8');
    const compiledTemplate = this.compile(fileContent);
    
    this.cache.set(resolvedPath, compiledTemplate);
    return compiledTemplate(data);
  }
}

module.exports = new EJS();
