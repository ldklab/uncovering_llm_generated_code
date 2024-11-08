"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("./compile/context");
const codegen_1 = require("./compile/codegen");
const core_1 = require("./core");
const draft7_1 = require("./vocabularies/draft7");
const draft7MetaSchema = require("./refs/json-schema-draft-07.json");

exports.KeywordCxt = context_1.default;
exports._ = codegen_1._;
exports.str = codegen_1.str;
exports.stringify = codegen_1.stringify;
exports.nil = codegen_1.nil;
exports.Name = codegen_1.Name;
exports.CodeGen = codegen_1.CodeGen;

const META_SUPPORT_DATA = ["/properties"];
const META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";

class Ajv extends core_1.default {
    _addVocabularies() {
        super._addVocabularies();
        for (const v of draft7_1.default) {
            this.addVocabulary(v);
        }
    }

    _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data, meta } = this.opts;
        if (meta) {
            const metaSchema = $data ? 
                this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : 
                draft7MetaSchema;
            this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
            this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
        }
    }

    defaultMeta() {
        return (this.opts.defaultMeta =
            super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined));
    }
}

exports.default = Ajv;
