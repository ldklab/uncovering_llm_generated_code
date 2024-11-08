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
        if (Array.isArray(node)) {
            return node.map(n => this.renderNode(n)).join('');
        }
        return this.renderNode(node);
    }

    renderNode(node) {
        switch (node.type) {
            case 'tag':
            case 'script':
            case 'style':
                return this.renderTag(node);
            case 'text':
                return this.options.decodeEntities ? this.decodeEntities(node.data) : node.data;
            case 'comment':
                return `<!--${node.data}-->`;
            case 'directive':
            case '!doctype':
                return `<!${node.data}>`;
            default:
                return '';
        }
    }

    renderTag(node) {
        const tagName = this.options.xmlMode === 'foreign' ? node.name.toLowerCase() : node.name;
        let attrs = this.renderAttributes(node.attribs);
        const hasChildren = node.children && node.children.length > 0;
        const isSelfClosing = this.isSelfClosing(node);

        if (isSelfClosing && !hasChildren) {
            return `<${tagName}${attrs}${this.options.selfClosingTags ? ' /' : ''}>`;
        }

        return `<${tagName}${attrs}>${this.render(node.children)}</${tagName}>`;
    }

    renderAttributes(attribs = {}) {
        return Object.entries(attribs)
            .map(([key, value]) => {
                if (value === "" && !this.options.emptyAttrs) {
                    return ` ${key}`;
                }
                return ` ${key}="${value.replace(/\"/g, '&quot;')}"`;
            })
            .join('');
    }

    isSelfClosing(node) {
        return node.name && (!node.children || node.children.length === 0);
    }

    decodeEntities(data) {
        return data.replace(/&quot;/g, '"')
                   .replace(/&amp;/g, '&')
                   .replace(/&gt;/g, '>')
                   .replace(/&lt;/g, '<');
    }
}

module.exports = {
    default: function(node, options) {
        const serializer = new DomSerializer(options);
        return serializer.render(node);
    }
};
