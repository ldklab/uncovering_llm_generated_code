"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;

// Importing required modules
const context = require("./compile/context");
exports.KeywordCxt = context.default;

const codegen = require("./compile/codegen");
exports._ = codegen._;
exports.str = codegen.str;
exports.stringify = codegen.stringify;
exports.nil = codegen.nil;
exports.Name = codegen.Name;
exports.CodeGen = codegen.CodeGen;

const core = require("./core");
const draft7Vocabularies = require("./vocabularies/draft7");
const draft7MetaSchema = require("./refs/json-schema-draft-07.json");

// Constants for meta schema references
const META_SUPPORT_DATA = ["/properties"];
const META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";

// Ajv Class extending core functionalities
class Ajv extends core.default {
    _addVocabularies() {
        super._addVocabularies();
        draft7Vocabularies.default.forEach((v) => this.addVocabulary(v));
    }

    _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data, meta } = this.opts;
        if (!meta) return;
        const metaSchema = $data 
            ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) 
            : draft7MetaSchema;
        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
    }

    defaultMeta() {
        return (this.opts.defaultMeta = 
            super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined));
    }
}

exports.default = Ajv;
