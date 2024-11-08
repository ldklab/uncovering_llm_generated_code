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
    if (this.templateCache[template]) {
      return this.templateCache[template];
    }
    
    const tokens = [];
    const sections = [];
    let index = 0, length = template.length;
    const openTag = this.tags[0], closeTag = this.tags[1];

    while (index < length) {
      const openIndex = template.indexOf(openTag, index);
      if (openIndex === -1) {
        tokens.push(['text', template.substring(index)]);
        break;
      }
      
      if (openIndex > index) {
        tokens.push(['text', template.substring(index, openIndex)]);
      }

      const closeIndex = template.indexOf(closeTag, openIndex + openTag.length);
      if (closeIndex === -1) throw new Error('Unclosed tag at ' + openIndex);

      const tag = template.substring(openIndex + openTag.length, closeIndex).trim();
      const sectionIndex = sections.length;

      if (tag[0] === '#') {
        sections.push(tag.substring(1));
        tokens.push(['#', tag.substring(1), closeIndex + closeTag.length]);
      } else if (tag[0] === '/') {
        if (!sections.length || sections[sectionIndex - 1] !== tag.substring(1)) {
          throw new Error('Unclosed section "' + tag.substring(1) + '" at ' + openIndex);
        }
        sections.pop();
      } else {
        tokens.push(['name', tag]);
      }
      
      index = closeIndex + closeTag.length;
    }

    if (sections.length) {
      throw new Error('Unclosed section "' + sections[sections.length - 1] + '"');
    }

    this.templateCache[template] = tokens;
    return tokens;
  }

  renderTokens(tokens, view, partials, originalView) {
    let result = '';

    tokens.forEach(token => {
      const [type, value] = token;

      switch (type) {
        case 'text':
          result += value;
          break;
        case 'name':
          result += Mustache.escapeHtml(this.lookup(value, view));
          break;
        case '#':
          const sectionData = this.lookup(value, view);
          if (!sectionData) return;
          if (Array.isArray(sectionData)) {
            sectionData.forEach(item => {
              result += this.renderTokens(tokens, item, partials, item);
            });
          } else {
            result += this.renderTokens(tokens, sectionData, partials, originalView);
          }
          break;
        default:
          break;
      }
    });

    return result;
  }

  lookup(name, view) {
    const names = name.split('.');
    let value = view;
    names.forEach(n => {
      if (value) value = value[n];
    });
    return value;
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Mustache;
} else {
  window.Mustache = Mustache;
}
