import * as z from "./base";
export interface ZodTransformerDef<T extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.transformer;
    schema: T;
}
export declare class ZodTransformer<T extends z.ZodTypeAny, Output = T["_type"]> extends z.ZodType<Output, ZodTransformerDef<T>, T["_input"]> {
    toJSON: () => {
        t: z.ZodTypes.transformer;
        schema: object;
    };
    default: never;
    static create: <I extends z.ZodTypeAny>(schema: I) => ZodTransformer<I, I["_output"]>;
}
