'use strict';

const Assert = require('@hapi/hoek/lib/assert');
const Clone = require('@hapi/hoek/lib/clone');

const Dependencies = {
    Cache: require('./cache'),
    Common: require('./common'),
    Compile: require('./compile'),
    Errors: require('./errors'),
    Extend: require('./extend'),
    Manifest: require('./manifest'),
    Ref: require('./ref'),
    Template: require('./template'),
    Trace: require('./trace'),
    Types: {
        alternatives: require('./types/alternatives'),
        any: require('./types/any'),
        array: require('./types/array'),
        boolean: require('./types/boolean'),
        date: require('./types/date'),
        function: require('./types/function'),
        link: require('./types/link'),
        number: require('./types/number'),
        object: require('./types/object'),
        string: require('./types/string'),
        symbol: require('./types/symbol'),
        binary: Buffer && require('./types/binary') // Conditional Import
    },
    Aliases: {
        alt: 'alternatives',
        bool: 'boolean',
        func: 'function'
    }
};

let Schemas;

const createRoot = () => {
    const root = {
        _types: new Set(Object.keys(Dependencies.Types))
    };

    root._types.forEach((type) => {
        root[type] = function (...args) {
            Assert(!args.length || ['alternatives', 'link', 'object'].includes(type), 'The', type, 'type does not allow arguments');
            return generateSchema(this, Dependencies.Types[type], args);
        };
    });

    const shortcutMethods = ['allow', 'custom', 'disallow', 'equal', 'exist', 'forbidden', 'invalid', 'not', 'only', 'optional', 'options', 'prefs', 'preferences', 'required', 'strip', 'valid', 'when'];
    shortcutMethods.forEach((method) => {
        root[method] = function (...args) {
            return this.any()[method](...args);
        };
    });

    Object.assign(root, rootMethods);
    Object.keys(Dependencies.Aliases).forEach((alias) => {
        root[alias] = root[Dependencies.Aliases[alias]];
    });

    root.x = root.expression;

    if (Dependencies.Trace.setup) {
        Dependencies.Trace.setup(root);
    }

    return root;
};

const rootMethods = {
    ValidationError: Dependencies.Errors.ValidationError,
    version: Dependencies.Common.version,
    cache: Dependencies.Cache.provider,

    assert(value, schema, ...args) {
        performAssert(value, schema, true, args);
    },

    attempt(value, schema, ...args) {
        return performAssert(value, schema, false, args);
    },

    build(desc) {
        Assert(typeof Dependencies.Manifest.build === 'function', 'Manifest functionality disabled');
        return Dependencies.Manifest.build(this, desc);
    },

    checkPreferences(prefs) {
        Dependencies.Common.checkPreferences(prefs);
    },

    compile(schema, options) {
        return Dependencies.Compile.compile(this, schema, options);
    },

    defaults(modifier) {
        Assert(typeof modifier === 'function', 'modifier must be a function');
        const modifiedJoi = Object.assign({}, this);
        modifiedJoi._types.forEach((type) => {
            const modifiedSchema = modifier(modifiedJoi[type]());
            Assert(Dependencies.Common.isSchema(modifiedSchema), 'modifier must return a valid schema object');
            modifiedJoi[type] = function (...args) {
                return generateSchema(this, modifiedSchema, args);
            };
        });
        return modifiedJoi;
    },

    expression(...args) {
        return new Dependencies.Template(...args);
    },

    extend(...extensions) {
        Dependencies.Common.verifyFlat(extensions, 'extend');
        Schemas = Schemas || require('./schemas');
        Assert(extensions.length, 'You need to provide at least one extension');
        this.assert(extensions, Schemas.extensions);

        const extendedJoi = Object.assign({}, this);
        extendedJoi._types = new Set(extendedJoi._types);

        extensions.forEach((extension) => {
            if (typeof extension === 'function') {
                extension = extension(extendedJoi);
            }
            this.assert(extension, Schemas.extension);

            const expandedExtensions = expandExtensions(extension, extendedJoi);
            expandedExtensions.forEach((item) => {
                Assert(extendedJoi[item.type] === undefined || extendedJoi._types.has(item.type), 'Cannot override name', item.type);
                const baseSchema = item.base || this.any();
                const newSchema = Dependencies.Extend.type(baseSchema, item);

                extendedJoi._types.add(item.type);
                extendedJoi[item.type] = function (...args) {
                    return generateSchema(this, newSchema, args);
                };
            });
        });

        return extendedJoi;
    },

    isError: Dependencies.Errors.ValidationError.isError,
    isExpression: Dependencies.Template.isTemplate,
    isRef: Dependencies.Ref.isRef,
    isSchema: Dependencies.Common.isSchema,

    in(...args) {
        return Dependencies.Ref.in(...args);
    },

    override: Dependencies.Common.symbols.override,

    ref(...args) {
        return Dependencies.Ref.create(...args);
    },

    types() {
        const typeInstances = {};
        this._types.forEach((type) => {
            typeInstances[type] = this[type]();
        });

        Object.keys(Dependencies.Aliases).forEach((alias) => {
            typeInstances[alias] = this[alias]();
        });

        return typeInstances;
    }
};

const performAssert = (value, schema, annotate, args) => {
    const [message, options] = args[0] instanceof Error || typeof args[0] === 'string' ? [args[0], args[1]] : [null, args[0]];
    const validationResult = schema.validate(value, Dependencies.Common.preferences({ errors: { stack: true } }, options || {}));

    let error = validationResult.error;
    if (!error) {
        return validationResult.value;
    }

    if (message instanceof Error) {
        throw message;
    }

    const displayMessage = annotate && typeof error.annotate === 'function' ? error.annotate() : error.message;
    error = error instanceof Dependencies.Errors.ValidationError ? error : Clone(error);
    error.message = message ? `${message} ${displayMessage}` : displayMessage;
    throw error;
};

const generateSchema = (root, schema, args) => {
    Assert(root, 'Must be invoked on a Joi instance.');

    schema.$_root = root;

    if (!schema._definition.args || !args.length) {
        return schema;
    }

    return schema._definition.args(schema, ...args);
};

const expandExtensions = (extension, joi) => {
    if (typeof extension.type === 'string') {
        return [extension];
    }

    const extendedTypes = [];
    joi._types.forEach((type) => {
        if (extension.type.test(type)) {
            extendedTypes.push({ ...extension, type, base: joi[type]() });
        }
    });

    return extendedTypes;
};

module.exports = createRoot();
