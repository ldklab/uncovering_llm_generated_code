import type { AnySchema, AnySchemaObject, AnyValidateFunction, EvaluatedProperties, EvaluatedItems } from "../types";
import type Ajv from "../core";
import type { InstanceOptions } from "../core";
import { CodeGen, Name, Code, ValueScopeName } from "./codegen";
import { LocalRefs } from "./resolve";
import { JSONType } from "./rules";
export declare type SchemaRefs = {
    [Ref in string]?: SchemaEnv | AnySchema;
};
export interface SchemaCxt {
    readonly gen: CodeGen;
    readonly allErrors?: boolean;
    readonly data: Name;
    readonly parentData: Name;
    readonly parentDataProperty: Code | number;
    readonly dataNames: Name[];
    readonly dataPathArr: (Code | number)[];
    readonly dataLevel: number;
    dataTypes: JSONType[];
    readonly topSchemaRef: Code;
    readonly validateName: Name;
    evaluated?: Name;
    readonly ValidationError?: Name;
    readonly schema: AnySchema;
    readonly schemaEnv: SchemaEnv;
    readonly strictSchema?: boolean;
    readonly rootId: string;
    baseId: string;
    readonly schemaPath: Code;
    readonly errSchemaPath: string;
    readonly errorPath: Code;
    readonly propertyName?: Name;
    readonly compositeRule?: boolean;
    props?: EvaluatedProperties | Name;
    items?: EvaluatedItems | Name;
    readonly createErrors?: boolean;
    readonly opts: InstanceOptions;
    readonly self: Ajv;
}
export interface SchemaObjCxt extends SchemaCxt {
    readonly schema: AnySchemaObject;
}
interface SchemaEnvArgs {
    readonly schema: AnySchema;
    readonly root?: SchemaEnv;
    readonly baseId?: string;
    readonly localRefs?: LocalRefs;
    readonly meta?: boolean;
}
export declare class SchemaEnv implements SchemaEnvArgs {
    readonly schema: AnySchema;
    readonly root: SchemaEnv;
    baseId: string;
    localRefs?: LocalRefs;
    readonly meta?: boolean;
    readonly $async?: boolean;
    readonly refs: SchemaRefs;
    readonly dynamicAnchors: {
        [Ref in string]?: true;
    };
    validate?: AnyValidateFunction;
    validateName?: ValueScopeName;
    constructor(env: SchemaEnvArgs);
}
export declare function compileSchema(this: Ajv, sch: SchemaEnv): SchemaEnv;
export declare function resolveRef(this: Ajv, root: SchemaEnv, baseId: string, ref: string): AnySchema | SchemaEnv | undefined;
export declare function resolveSchema(this: Ajv, root: SchemaEnv, // root object with properties schema, refs TODO below SchemaEnv is assigned to it
ref: string): SchemaEnv | undefined;
export {};
