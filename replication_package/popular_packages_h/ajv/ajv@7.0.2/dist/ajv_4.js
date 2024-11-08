"use strict";
import Core from './core';
import { default as KeywordCxt } from './compile/context';
import { _, str, stringify, nil, Name, CodeGen } from './compile/codegen';
import draft7Vocabularies from './vocabularies/draft7';
import draft7MetaSchema from './refs/json-schema-draft-07.json';

const META_SUPPORT_DATA = ["/properties"];
const META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";

class Ajv extends Core {
    _addVocabularies() {
        super._addVocabularies();
        draft7Vocabularies.forEach(vocab => this.addVocabulary(vocab));
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
        return (this.opts.defaultMeta = super.defaultMeta() || 
               (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined));
    }
}

export default Ajv;
export { KeywordCxt, _, str, stringify, nil, Name, CodeGen };
