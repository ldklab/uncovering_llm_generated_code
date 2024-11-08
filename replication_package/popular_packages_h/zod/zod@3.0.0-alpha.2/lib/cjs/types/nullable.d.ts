import * as z from "./base";
export interface ZodNullableDef<T extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.nullable;
    innerType: T;
}
export declare type ZodNullableType<T extends z.ZodTypeAny> = T extends ZodNullable<z.ZodTypeAny> ? T : ZodNullable<T>;
export declare class ZodNullable<T extends z.ZodTypeAny> extends z.ZodType<T["_output"] | null, ZodNullableDef<T>, T["_input"] | null> {
    toJSON: () => {
        t: z.ZodTypes.nullable;
        innerType: object;
    };
    static create: <T_1 extends z.ZodTypeAny>(type: T_1) => ZodNullableType<T_1>;
}
