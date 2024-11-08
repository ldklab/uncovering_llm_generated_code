"use strict";

// Importing required modules
const Core = require("./core").default;
const draft7Vocabularies = require("./vocabularies/draft7").default;
const discriminator = require("./vocabularies/discriminator").default;
const draft7MetaSchema = require("./refs/json-schema-draft-07.json");
const validate = require("./compile/validate");
const codegen = require("./compile/codegen");
const ValidationError = require("./runtime/validation_error").default;
const MissingRefError = require("./compile/ref_error").default;

// Constants
const META_SUPPORT_DATA = ["/properties"];
const META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";

// Ajv class definition
class Ajv extends Core {
    _addVocabularies() {
        super._addVocabularies();
        draft7Vocabularies.forEach((vocab) => this.addVocabulary(vocab));
        if (this.opts.discriminator) this.addKeyword(discriminator);
    }

    _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        if (!this.opts.meta) return;
        const metaSchema = this.opts.$data
            ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA)
            : draft7MetaSchema;
        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
    }

    defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined);
    }
}

// Exporting modules and components
exports.Ajv = Ajv;
exports.KeywordCxt = validate.KeywordCxt;
exports._ = codegen._;
exports.str = codegen.str;
exports.stringify = codegen.stringify;
exports.nil = codegen.nil;
exports.Name = codegen.Name;
exports.CodeGen = codegen.CodeGen;
exports.ValidationError = ValidationError;
exports.MissingRefError = MissingRefError;

// Module exports for usage in other files
module.exports = exports = Ajv;
module.exports.Ajv = Ajv;
exports.default = Ajv;
