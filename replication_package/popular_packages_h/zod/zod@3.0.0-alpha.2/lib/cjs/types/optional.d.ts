import { ZodType, ZodTypeAny, ZodTypeDef, ZodTypes } from "./base";
export interface ZodOptionalDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    t: ZodTypes.optional;
    innerType: T;
}
export declare type ZodOptionalType<T extends ZodTypeAny> = T extends ZodOptional<ZodTypeAny> ? T : ZodOptional<T>;
export declare class ZodOptional<T extends ZodTypeAny> extends ZodType<T["_output"] | undefined, ZodOptionalDef<T>, T["_input"] | undefined> {
    toJSON: () => {
        t: ZodTypes.optional;
        innerType: object;
    };
    static create: <T_1 extends ZodTypeAny>(type: T_1) => ZodOptionalType<T_1>;
}
