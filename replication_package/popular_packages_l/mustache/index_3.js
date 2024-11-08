class Mustache {

  constructor() {
    this.tags = ['{{', '}}'];
    this.templateCache = {};
  }

  static escapeHtml(text) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    };
    return String(text).replace(/[&<>"'\/]/g, s => entityMap[s]);
  }

  static render(template, view, partials = {}, tags = null) {
    const mustache = new Mustache();
    if (tags) mustache.tags = tags;
    const tokens = mustache.parseTemplate(template);
    return mustache.renderTokens(tokens, view, partials, view);
  }

  parseTemplate(template) {
    if (this.templateCache[template]) {
      return this.templateCache[template];
    }

    const tokens = [];
    const sections = [];
    let index = 0, length = template.length;

    while (index < length) {
      let openIndex = template.indexOf(this.tags[0], index);

      if (openIndex !== -1) {
        if (openIndex > index) {
          tokens.push(['text', template.slice(index, openIndex)]);
        }

        const closeIndex = template.indexOf(this.tags[1], openIndex);
        if (closeIndex === -1) throw new Error('Unclosed tag at ' + openIndex);

        const tagContent = template.slice(openIndex + this.tags[0].length, closeIndex).trim();
        
        if (tagContent[0] === '#') {
          sections.push(tagContent.slice(1));
          tokens.push(['#', tagContent.slice(1), closeIndex + this.tags[1].length]);
        } else if (tagContent[0] === '/') {
          const sectionName = tagContent.slice(1);
          if (!sections.length || sections[sections.length - 1] !== sectionName) {
            throw new Error(`Unclosed section "${sectionName}" at ${openIndex}`);
          }
          sections.pop();
        } else {
          tokens.push(['name', tagContent]);
        }
        
        index = closeIndex + this.tags[1].length;
      } else {
        tokens.push(['text', template.slice(index)]);
        index = length;
      }
    }

    if (sections.length) {
      throw new Error(`Unclosed section "${sections[sections.length - 1]}"`);
    }

    this.templateCache[template] = tokens;
    return tokens;
  }

  renderTokens(tokens, view, partials, originalView) {
    let renderedOutput = '';

    tokens.forEach(([type, value]) => {
      if (type === 'text') {
        renderedOutput += value;
      } else if (type === 'name') {
        renderedOutput += Mustache.escapeHtml(this.lookup(value, view));
      } else if (type === '#') {
        const sectionData = this.lookup(value, view);
        if (Array.isArray(sectionData)) {
          sectionData.forEach(item => {
            renderedOutput += this.renderTokens(tokens, item, partials, item);
          });
        } else if (sectionData) {
          renderedOutput += this.renderTokens(tokens, sectionData, partials, originalView);
        }
      }
    });

    return renderedOutput;
  }

  lookup(key, context) {
    return key.split('.').reduce((result, keyPart) => result ? result[keyPart] : undefined, context);
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Mustache;
} else {
  window.Mustache = Mustache;
}
