import * as z from "./base";
export interface ZodLazyDef<T extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.lazy;
    getter: () => T;
}
export declare class ZodLazy<T extends z.ZodTypeAny> extends z.ZodType<z.output<T>, ZodLazyDef<T>, z.input<T>> {
    get schema(): T;
    toJSON: () => never;
    static create: <T_1 extends z.ZodTypeAny>(getter: () => T_1) => ZodLazy<T_1>;
}
