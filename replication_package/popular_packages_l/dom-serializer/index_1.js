// dom-serializer.js

class DomSerializer {
    constructor(options = {}) {
        this.options = {
            encodeEntities: 'utf8',
            decodeEntities: true,
            emptyAttrs: false,
            selfClosingTags: false,
            xmlMode: false,
            ...options
        };
    }

    render(node) {
        return Array.isArray(node) ? node.map(n => this.renderNode(n)).join('') : this.renderNode(node);
    }

    renderNode(node) {
        const { type, data, name, children } = node;
        switch (type) {
            case 'tag':
            case 'script':
            case 'style':
                return this.renderTag(node);
            case 'text':
                return this.options.decodeEntities ? this.decodeEntities(data) : data;
            case 'comment':
                return `<!--${data}-->`;
            case 'directive':
            case '!doctype':
                return `<!${data}>`;
            default:
                return '';
        }
    }

    renderTag(node) {
        const { name, children, attribs } = node;
        const tagName = this.options.xmlMode === 'foreign' ? name.toLowerCase() : name;
        let attrs = this.renderAttributes(attribs);
        const hasChildren = children && children.length > 0;
        const isSelfClosing = this.isSelfClosing(node);

        if (isSelfClosing && !hasChildren) {
            return `<${tagName}${attrs}${this.options.selfClosingTags ? ' /' : ''}>`;
        }

        return `<${tagName}${attrs}>${this.render(children)}</${tagName}>`;
    }

    renderAttributes(attribs = {}) {
        return Object.entries(attribs)
            .map(([key, value]) => value === "" && !this.options.emptyAttrs ? ` ${key}` : ` ${key}="${value.replace(/\"/g, '&quot;')}"`)
            .join('');
    }

    isSelfClosing(node) {
        return node.name && (!node.children || node.children.length === 0);
    }

    decodeEntities(data) {
        return data.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    }
}

module.exports = {
    default: function(node, options) {
        return new DomSerializer(options).render(node);
    }
};
