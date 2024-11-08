const sax = require('sax');
const xmlbuilder = require('xmlbuilder');

class Parser {
    constructor(options = {}) {
        this.defaultOptions = {
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
        };
        this.options = { ...this.defaultOptions, ...options };
    }

    parseString(xml, options, callback) {
        options = typeof options === 'function' ? (callback = options, {}) : options;
        options = { ...this.options, ...options };
        const parser = sax.parser(options.strict, { trim: options.trim, normalize: options.normalize });

        let result = options.explicitRoot ? {} : null;
        let current = result;

        parser.onopentag = (node) => {
            const obj = {};
            if (!options.ignoreAttrs) obj[options.attrkey] = node.attributes;
            obj[options.charkey] = '';
            if (!result && options.explicitRoot) {
                result = { [node.name]: obj };
                current = result[node.name];
            } else {
                if (!current[node.name]) current[node.name] = [];
                current[node.name].push(obj);
                current = obj;
            }
        };

        parser.ontext = (text) => {
            if (current) current[options.charkey] += text;
        };

        parser.onclosetag = () => {
            current = result;
        };

        parser.onend = () => callback(null, result);
        parser.onerror = (err) => callback(err);

        parser.write(xml).close();
    }

    parseStringPromise(xml, options) {
        return new Promise((resolve, reject) => {
            this.parseString(xml, options, (err, result) => err ? reject(err) : resolve(result));
        });
    }
}

class Builder {
    constructor(options = {}) {
        this.defaultOptions = {
            rootName: 'root',
            renderOpts: { pretty: true, indent: '  ', newline: '\n' },
            xmldec: { version: '1.0', encoding: 'UTF-8', standalone: true },
            doctype: null,
            allowSurrogateChars: false,
            cdata: false,
        };
        this.options = { ...this.defaultOptions, ...options };
    }

    buildObject(obj) {
        const rootName = this.options.rootName || Object.keys(obj)[0];
        const doc = xmlbuilder.create(rootName, this.options.xmldec, this.options.doctype, {
            stringify: { attrValue: (val) => `<![CDATA[${val}]]>` }
        });

        function build(nodeObj, node) {
            for (const key in nodeObj) {
                if (key === this.options.attrkey) {
                    for (const attr in nodeObj[key]) {
                        node.attribute(attr, nodeObj[key][attr]);
                    }
                } else if (key === this.options.charkey) {
                    node.text(nodeObj[key]);
                } else if (Array.isArray(nodeObj[key])) {
                    nodeObj[key].forEach(item => build(item, node.element(key)));
                } else {
                    build(nodeObj[key], node.element(key));
                }
            }
        }

        build(obj[rootName], doc);
        return doc.end(this.options.renderOpts);
    }
}

module.exports = { Parser, Builder };
