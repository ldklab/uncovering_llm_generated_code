const sax = require('sax');
const xmlbuilder = require('xmlbuilder');

/**
 * XML to JS Parser
 */
class Parser {
    constructor(options = {}) {
        this.options = {
            attrkey: '$',
            charkey: '_',
            explicitCharkey: false,
            trim: false,
            normalizeTags: false,
            normalize: false,
            explicitRoot: true,
            emptyTag: '',
            explicitArray: true,
            ignoreAttrs: false,
            mergeAttrs: false,
            xmlns: false,
            explicitChildren: false,
            childkey: '$$',
            preserveChildrenOrder: false,
            charsAsChildren: false,
            includeWhiteChars: false,
            async: false,
            strict: true,
            attrNameProcessors: null,
            attrValueProcessors: null,
            tagNameProcessors: null,
            valueProcessors: null,
            ...options
        };
    }

    parseString(xml, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        options = { ...this.options, ...options };
        const parser = sax.parser(options.strict, { trim: options.trim, normalize: options.normalize });

        let result = options.explicitRoot ? {} : null;
        let current = result;

        parser.onopentag = (node) => {
            const obj = {};
            if (!options.ignoreAttrs) {
                obj[options.attrkey] = node.attributes;
            }
            obj[options.charkey] = '';
            if (!result && options.explicitRoot) {
                result = current = { [node.name]: obj };
            } else {
                if (!Array.isArray(current[node.name]) && options.explicitArray) {
                    current[node.name] = [];
                }
                const currentNode = current[node.name];
                if (Array.isArray(currentNode)) {
                    current = { ...obj };
                    currentNode.push(current);
                } else {
                    current = currentNode;
                }
            }
        };

        parser.ontext = (text) => {
            if (current) {
                current[options.charkey] += text;
            }
        };

        parser.onclosetag = () => {
            current = result;
        };

        parser.onend = () => {
            callback(null, result);
        };

        parser.onerror = (err) => {
            callback(err);
        };

        parser.write(xml).close();
    }

    parseStringPromise(xml, options) {
        return new Promise((resolve, reject) => {
            this.parseString(xml, options, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

/**
 * JS to XML Builder
 */
class Builder {
    constructor(options = {}) {
        this.options = {
            rootName: 'root',
            renderOpts: { pretty: true, indent: '  ', newline: '\n' },
            xmldec: { version: '1.0', encoding: 'UTF-8', standalone: true },
            doctype: null,
            allowSurrogateChars: false,
            cdata: false,
            ...options
        };
    }

    buildObject(obj) {
        const rootName = this.options.rootName || Object.keys(obj)[0];
        const doc = xmlbuilder.create(rootName, this.options.xmldec, this.options.doctype, {
            stringify: {
                attrValue(val) { return `<![CDATA[${val}]]>`; }
            }
        });

        function build(obj, node) {
            for (let key in obj) {
                if (key === this.options.attrkey) {
                    const attributes = obj[key];
                    for (let attr in attributes) {
                        node.attribute(attr, attributes[attr]);
                    }
                } else if (key === this.options.charkey) {
                    node.text(obj[key]);
                } else {
                    const val = obj[key];
                    if (Array.isArray(val)) {
                        val.forEach(item => build(item, node.element(key)));
                    } else {
                        build(val, node.element(key));
                    }
                }
            }
        }

        build(obj[rootName], doc);
        return doc.end(this.options.renderOpts);
    }
}

module.exports = { Parser, Builder };
