class SimpleTemplatingEngine {

  constructor() {
    this.defaultTags = ['{{', '}}'];
    this.cache = {};
  }

  static sanitizeHtml(input) {
    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    };

    return String(input).replace(/[&<>"'\/]/g, char => htmlEntities[char]);
  }

  static process(templateString, dataContext, subTemplates = {}, customTags = null) {
    const engine = new SimpleTemplatingEngine();
    if (customTags) engine.defaultTags = customTags;
    const tokenList = engine.extractTokens(templateString);
    return engine.interpretTokens(tokenList, dataContext, subTemplates, dataContext);
  }

  extractTokens(templateString) {
    if (this.cache[templateString]) {
      return this.cache[templateString];
    }

    const tokenList = [];
    const sectionStack = [];
    let currentIndex = 0, templateLength = templateString.length;
    const startTag = this.defaultTags[0], endTag = this.defaultTags[1];

    while (currentIndex < templateLength) {
      const startTagIndex = templateString.indexOf(startTag, currentIndex);
      if (startTagIndex === -1) {
        tokenList.push(['text', templateString.substring(currentIndex)]);
        break;
      }

      if (startTagIndex > currentIndex) {
        tokenList.push(['text', templateString.substring(currentIndex, startTagIndex)]);
      }

      const endTagIndex = templateString.indexOf(endTag, startTagIndex + startTag.length);
      if (endTagIndex === -1) throw new Error('Tag not closed at ' + startTagIndex);

      const tagContent = templateString.substring(startTagIndex + startTag.length, endTagIndex).trim();
      const currentSectionIndex = sectionStack.length;

      if (tagContent[0] === '#') {
        sectionStack.push(tagContent.substring(1));
        tokenList.push(['#', tagContent.substring(1), endTagIndex + endTag.length]);
      } else if (tagContent[0] === '/') {
        if (!sectionStack.length || sectionStack[currentSectionIndex - 1] !== tagContent.substring(1)) {
          throw new Error('Section "' + tagContent.substring(1) + '" not closed at ' + startTagIndex);
        }
        sectionStack.pop();
      } else {
        tokenList.push(['name', tagContent]);
      }

      currentIndex = endTagIndex + endTag.length;
    }

    if (sectionStack.length) {
      throw new Error('Section "' + sectionStack[sectionStack.length - 1] + '" not closed');
    }

    this.cache[templateString] = tokenList;
    return tokenList;
  }

  interpretTokens(tokenList, dataContext, subTemplates, mainDataContext) {
    let outputString = '';

    tokenList.forEach(token => {
      const [type, content] = token;

      switch (type) {
        case 'text':
          outputString += content;
          break;
        case 'name':
          outputString += SimpleTemplatingEngine.sanitizeHtml(this.retrieveValue(content, dataContext));
          break;
        case '#':
          const sectionContent = this.retrieveValue(content, dataContext);
          if (!sectionContent) return;
          if (Array.isArray(sectionContent)) {
            sectionContent.forEach(item => {
              outputString += this.interpretTokens(tokenList, item, subTemplates, item);
            });
          } else {
            outputString += this.interpretTokens(tokenList, sectionContent, subTemplates, mainDataContext);
          }
          break;
        default:
          break;
      }
    });

    return outputString;
  }

  retrieveValue(key, dataContext) {
    const keys = key.split('.');
    let result = dataContext;
    keys.forEach(k => {
      if (result) result = result[k];
    });
    return result;
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = SimpleTemplatingEngine;
} else {
  window.SimpleTemplatingEngine = SimpleTemplatingEngine;
}
