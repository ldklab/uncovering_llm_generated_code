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
    const tokens = mustache.parse(template);
    return mustache.renderTokens(tokens, view, partials, view);
  }

  parse(template) {
    if (this.templateCache[template]) return this.templateCache[template];

    const tokens = [];
    const sections = [];
    let index = 0;
    const openTag = this.tags[0], closeTag = this.tags[1];

    while (index < template.length) {
      const openIndex = template.indexOf(openTag, index);
      if (openIndex === -1) {
        tokens.push(['text', template.substring(index)]);
        break;
      }
      
      if (openIndex > index) {
        tokens.push(['text', template.substring(index, openIndex)]);
      }

      const closeIndex = template.indexOf(closeTag, openIndex + openTag.length);
      if (closeIndex === -1) throw new Error(`Unclosed tag at ${openIndex}`);

      const tagContent = template.substring(openIndex + openTag.length, closeIndex).trim();
      if (tagContent.startsWith('#')) {
        sections.push(tagContent.slice(1));
        tokens.push(['#', tagContent.slice(1), closeIndex + closeTag.length]);
      } else if (tagContent.startsWith('/')) {
        if (!sections.length || sections[sections.length - 1] !== tagContent.slice(1)) {
          throw new Error(`Unclosed section "${tagContent.slice(1)}" at ${openIndex}`);
        }
        sections.pop();
      } else {
        tokens.push(['name', tagContent]);
      }

      index = closeIndex + closeTag.length;
    }

    if (sections.length) {
      throw new Error(`Unclosed section "${sections[sections.length - 1]}"`);
    }

    return this.templateCache[template] = tokens;
  }

  renderTokens(tokens, view, partials, originalView) {
    return tokens.reduce((result, token) => {
      const [type, value] = token;
      
      if (type === 'text') {
        return result + value;
      } else if (type === 'name') {
        return result + Mustache.escapeHtml(this.lookup(value, view));
      } else if (type === '#') {
        const sectionData = this.lookup(value, view);
        if (!sectionData) return result;

        if (Array.isArray(sectionData)) {
          return result + sectionData.reduce((secResult, item) => {
            return secResult + this.renderTokens(tokens, item, partials, item);
          }, '');
        }

        return result + this.renderTokens(tokens, sectionData, partials, originalView);
      }

      return result;
    }, '');
  }

  lookup(name, view) {
    return name.split('.').reduce((value, key) => value && value[key], view);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Mustache;
} else {
  window.Mustache = Mustache;
}
