"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

// Export identifiers for external use
exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv = void 0;

// Import necessary modules
const core = require("./core");
const draft7 = require("./vocabularies/draft7");
const discriminator = require("./vocabularies/discriminator");
const draft7MetaSchema = require("./refs/json-schema-draft-07.json");

// Constants for meta schema support
const META_SUPPORT_DATA = ["/properties"];
const META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";

// Define the Ajv class extending a core class
class Ajv extends core.default {
    _addVocabularies() {
        super._addVocabularies(); // Call parent method
        draft7.default.forEach(v => this.addVocabulary(v)); // Add draft7 vocabularies
        if (this.opts.discriminator) {
            this.addKeyword(discriminator.default); // Add discriminator vocabulary if an option is set
        }
    }

    _addDefaultMetaSchema() {
        super._addDefaultMetaSchema(); // Call parent method
        if (!this.opts.meta) return; // Exit if meta option is not set

        // Determine which meta schema to use
        const metaSchema = this.opts.$data ? 
            this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : draft7MetaSchema;

        // Add the meta schema and set references
        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
    }

    defaultMeta() {
        return (this.opts.defaultMeta = super.defaultMeta() || 
               (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined)); // Return default meta configuration
    }
}

// Export Ajv class
exports.Ajv = Ajv;
module.exports = exports = Ajv;
module.exports.Ajv = Ajv;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Ajv;

// Additional imports and exports for components used with Ajv
const validate = require("./compile/validate");
Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: () => validate.KeywordCxt });

const codegen = require("./compile/codegen");
Object.defineProperty(exports, "_", { enumerable: true, get: () => codegen._ });
Object.defineProperty(exports, "str", { enumerable: true, get: () => codegen.str });
Object.defineProperty(exports, "stringify", { enumerable: true, get: () => codegen.stringify });
Object.defineProperty(exports, "nil", { enumerable: true, get: () => codegen.nil });
Object.defineProperty(exports, "Name", { enumerable: true, get: () => codegen.Name });
Object.defineProperty(exports, "CodeGen", { enumerable: true, get: () => codegen.CodeGen });

const validationError = require("./runtime/validation_error");
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: () => validationError.default });

const refError = require("./compile/ref_error");
Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: () => refError.default });
