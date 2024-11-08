import { errorUtil } from "../helpers/errorUtil";
import { StringValidation } from "../ZodError";
import * as z from "./base";
export interface ZodStringDef extends z.ZodTypeDef {
    t: z.ZodTypes.string;
    validation: {
        uuid?: true;
        custom?: ((val: any) => boolean)[];
    };
}
export declare class ZodString extends z.ZodType<string, ZodStringDef> {
    inputSchema: this;
    outputSchema: this;
    toJSON: () => ZodStringDef;
    min: (minLength: number, message?: string | {
        message?: string | undefined;
    } | undefined) => this;
    max: (maxLength: number, message?: string | {
        message?: string | undefined;
    } | undefined) => this;
    length(len: number, message?: errorUtil.ErrMessage): this;
    protected _regex: (regex: RegExp, validation: StringValidation, message?: string | {
        message?: string | undefined;
    } | undefined) => this;
    email: (message?: string | {
        message?: string | undefined;
    } | undefined) => this;
    url: (message?: string | {
        message?: string | undefined;
    } | undefined) => this;
    uuid: (message?: string | {
        message?: string | undefined;
    } | undefined) => this;
    regex: (regexp: RegExp, message?: string | {
        message?: string | undefined;
    } | undefined) => this;
    nonempty: (message?: string | {
        message?: string | undefined;
    } | undefined) => this;
    static create: () => ZodString;
}
