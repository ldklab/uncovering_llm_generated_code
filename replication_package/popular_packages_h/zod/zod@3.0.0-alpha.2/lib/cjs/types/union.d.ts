import * as z from "./base";
export interface ZodUnionDef<T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]] = [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]> extends z.ZodTypeDef {
    t: z.ZodTypes.union;
    options: T;
}
export declare class ZodUnion<T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]> extends z.ZodType<T[number]["_output"], ZodUnionDef<T>, T[number]["_input"]> {
    toJSON: () => object;
    get options(): T;
    static create: <T_1 extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>(types: T_1) => ZodUnion<T_1>;
}
