import type { SchemaMap } from "../types";
import type { SchemaCxt } from "../compile";
import type KeywordCxt from "../compile/context";
import { CodeGen, Code, Name } from "../compile/codegen";
export declare function checkReportMissingProp(cxt: KeywordCxt, prop: string): void;
export declare function checkMissingProp({ data, it: { opts } }: KeywordCxt, properties: string[], missing: Name): Code;
export declare function reportMissingProp(cxt: KeywordCxt, missing: Name): void;
export declare function propertyInData(data: Name, property: Name | string, ownProperties?: boolean): Code;
export declare function noPropertyInData(data: Name, property: Name | string, ownProperties?: boolean): Code;
export declare function allSchemaProperties(schemaMap?: SchemaMap): string[];
export declare function schemaProperties(it: SchemaCxt, schemaMap: SchemaMap): string[];
export declare function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }: KeywordCxt, func: Code, context: Code, passSchema?: boolean): Code;
export declare function usePattern(gen: CodeGen, pattern: string): Name;