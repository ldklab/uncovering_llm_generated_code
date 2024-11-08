"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv = void 0;

const coreModule = require("./core");
const draft7Vocabularies = require("./vocabularies/draft7");
const discriminatorKeyword = require("./vocabularies/discriminator");
const draft7MetaSchema = require("./refs/json-schema-draft-07.json");
const META_SUPPORT_DATA = ["/properties"];
const META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";

class Ajv extends coreModule.default {
    _addVocabularies() {
        super._addVocabularies();
        draft7Vocabularies.default.forEach(vocabulary => this.addVocabulary(vocabulary));
        if (this.opts.discriminator) {
            this.addKeyword(discriminatorKeyword.default);
        }
    }

    _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        if (!this.opts.meta) return;

        const metaSchema = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : draft7MetaSchema;
        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
    }

    defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined);
    }
}

exports.Ajv = Ajv;
module.exports = exports = Ajv;
module.exports.Ajv = Ajv;

var validateModule = require("./compile/validate");
Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: () => validateModule.KeywordCxt });

var codegenModule = require("./compile/codegen");
Object.defineProperty(exports, "_", { enumerable: true, get: () => codegenModule._ });
Object.defineProperty(exports, "str", { enumerable: true, get: () => codegenModule.str });
Object.defineProperty(exports, "stringify", { enumerable: true, get: () => codegenModule.stringify });
Object.defineProperty(exports, "nil", { enumerable: true, get: () => codegenModule.nil });
Object.defineProperty(exports, "Name", { enumerable: true, get: () => codegenModule.Name });
Object.defineProperty(exports, "CodeGen", { enumerable: true, get: () => codegenModule.CodeGen });

var validationError = require("./runtime/validation_error");
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: () => validationError.default });

var refError = require("./compile/ref_error");
Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: () => refError.default });
