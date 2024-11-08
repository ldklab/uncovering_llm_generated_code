"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;

// Importing dependencies
const contextModule = require("./compile/context");
exports.KeywordCxt = contextModule.default;

const codegenModule = require("./compile/codegen");
Object.defineProperty(exports, "_", { enumerable: true, get: function () { return codegenModule._; } });
Object.defineProperty(exports, "str", { enumerable: true, get: function () { return codegenModule.str; } });
Object.defineProperty(exports, "stringify", { enumerable: true, get: function () { return codegenModule.stringify; } });
Object.defineProperty(exports, "nil", { enumerable: true, get: function () { return codegenModule.nil; } });
Object.defineProperty(exports, "Name", { enumerable: true, get: function () { return codegenModule.Name; } });
Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function () { return codegenModule.CodeGen; } });

const coreModule = require("./core");
const draft7Vocabularies = require("./vocabularies/draft7");
const draft7MetaSchema = require("./refs/json-schema-draft-07.json");

const META_SUPPORT_DATA = ["/properties"];
const META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";

// Ajv class extending core functionality for JSON Schema Draft-07
class Ajv extends coreModule.default {
    _addVocabularies() {
        super._addVocabularies();
        draft7Vocabularies.default.forEach(vocab => this.addVocabulary(vocab));
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
        return this.opts.defaultMeta = 
            super.defaultMeta() || 
            (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined);
    }
}

exports.default = Ajv;
