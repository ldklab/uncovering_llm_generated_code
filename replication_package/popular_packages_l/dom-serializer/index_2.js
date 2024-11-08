// dom-serializer.js

class DomSerializer {
    constructor(customOptions = {}) {
        // Setting default options merging with custom options if provided
        this.options = {
            encodeEntities: 'utf8',
            decodeEntities: true,
            emptyAttrs: false,
            selfClosingTags: false,
            xmlMode: false,
            ...customOptions
        };
    }

    render(node) {
        // Render an array of nodes or a single node
        return Array.isArray(node) ? node.map(n => this.renderNode(n)).join('') : this.renderNode(node);
    }

    renderNode(node) {
        // Determine method of rendering based on node type
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
        // Serialize a tag node including its children
        const tagName = this.options.xmlMode === 'foreign' ? node.name.toLowerCase() : node.name;
        let attrs = this.renderAttributes(node.attribs);
        const hasChildren = node.children && node.children.length > 0;
        const isSelfClosing = this.isSelfClosing(node);

        // Render self-closing or normal tags depending on options and presence of children
        if (isSelfClosing && !hasChildren) {
            return `<${tagName}${attrs}${this.options.selfClosingTags ? ' /' : ''}>`;
        }

        return `<${tagName}${attrs}>${this.render(node.children)}</${tagName}>`;
    }

    renderAttributes(attribs = {}) {
        // Convert attributes to string format, handle optional empty attributes
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
        // Determine if the node can be self-closing
        return node.name && (!node.children || node.children.length === 0);
    }

    decodeEntities(data) {
        // Placeholder for actual entity decoding
        return data.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    }
}

module.exports = {
    default: function(node, options) {
        // Export a function that creates a DomSerializer and renders a node
        const serializer = new DomSerializer(options);
        return serializer.render(node);
    }
};
