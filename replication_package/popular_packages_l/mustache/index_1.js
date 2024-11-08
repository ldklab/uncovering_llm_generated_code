class CustomMustacheTemplate {

  constructor() {
    this.delimiters = ['{{', '}}'];
    this.cache = {};
  }

  static escapeSpecialChars(html) {
    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    };
    return String(html).replace(/[&<>"'\/]/g, char => htmlEntities[char]);
  }

  static interpret(template, context, fragments = {}, delimiters = null) {
    const mustacheInstance = new CustomMustacheTemplate();
    if (delimiters) mustacheInstance.delimiters = delimiters;
    const parsedTokens = mustacheInstance.tokenize(template);
    return mustacheInstance.generateOutput(parsedTokens, context, fragments, context);
  }

  tokenize(template) {
    if (this.cache[template]) {
      return this.cache[template];
    }

    const tokens = [];
    const sectionsStack = [];
    let cursor = 0, templateLength = template.length;
    const [startDelimiter, endDelimiter] = this.delimiters;

    while (cursor < templateLength) {
      const startDelimiterIndex = template.indexOf(startDelimiter, cursor);
      if (startDelimiterIndex === -1) {
        tokens.push(['text', template.slice(cursor)]);
        break;
      }

      if (startDelimiterIndex > cursor) {
        tokens.push(['text', template.slice(cursor, startDelimiterIndex)]);
      }

      const endDelimiterIndex = template.indexOf(endDelimiter, startDelimiterIndex + startDelimiter.length);
      if (endDelimiterIndex === -1) throw new Error('Missing closing tag at ' + startDelimiterIndex);

      const tagContent = template.slice(startDelimiterIndex + startDelimiter.length, endDelimiterIndex).trim();
      const latestSectionIndex = sectionsStack.length;

      if (tagContent[0] === '#') {
        sectionsStack.push(tagContent.slice(1));
        tokens.push(['section_start', tagContent.slice(1), endDelimiterIndex + endDelimiter.length]);
      } else if (tagContent[0] === '/') {
        if (!sectionsStack.length || sectionsStack[latestSectionIndex - 1] !== tagContent.slice(1)) {
          throw new Error(`Section "${tagContent.slice(1)}" not correctly closed at ${startDelimiterIndex}`);
        }
        sectionsStack.pop();
      } else {
        tokens.push(['variable', tagContent]);
      }

      cursor = endDelimiterIndex + endDelimiter.length;
    }

    if (sectionsStack.length) {
      throw new Error(`Unclosed section "${sectionsStack[sectionsStack.length - 1]}"`);
    }

    this.cache[template] = tokens;
    return tokens;
  }

  generateOutput(tokens, context, fragments, rootContext) {
    let renderedString = '';

    tokens.forEach(token => {
      const [tokenType, tokenValue] = token;

      switch (tokenType) {
        case 'text':
          renderedString += tokenValue;
          break;
        case 'variable':
          renderedString += CustomMustacheTemplate.escapeSpecialChars(this.resolve(tokenValue, context));
          break;
        case 'section_start':
          const sectionContent = this.resolve(tokenValue, context);
          if (!sectionContent) return;
          if (Array.isArray(sectionContent)) {
            sectionContent.forEach(item => {
              renderedString += this.generateOutput(tokens, item, fragments, item);
            });
          } else {
            renderedString += this.generateOutput(tokens, sectionContent, fragments, rootContext);
          }
          break;
        default:
          break;
      }
    });

    return renderedString;
  }

  resolve(path, context) {
    const pathSegments = path.split('.');
    let result = context;
    pathSegments.forEach(segment => {
      if (result) result = result[segment];
    });
    return result;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomMustacheTemplate;
} else {
  window.CustomMustacheTemplate = CustomMustacheTemplate;
}
