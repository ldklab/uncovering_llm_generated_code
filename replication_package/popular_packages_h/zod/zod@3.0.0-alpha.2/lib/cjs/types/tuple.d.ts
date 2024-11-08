import * as z from "./base";
export declare type OutputTypeOfTuple<T extends [z.ZodTypeAny, ...z.ZodTypeAny[]] | []> = {
    [k in keyof T]: T[k] extends z.ZodType<any, any> ? T[k]["_output"] : never;
};
export declare type InputTypeOfTuple<T extends [z.ZodTypeAny, ...z.ZodTypeAny[]] | []> = {
    [k in keyof T]: T[k] extends z.ZodType<any, any> ? T[k]["_input"] : never;
};
export interface ZodTupleDef<T extends [z.ZodTypeAny, ...z.ZodTypeAny[]] | [] = [z.ZodTypeAny, ...z.ZodTypeAny[]]> extends z.ZodTypeDef {
    t: z.ZodTypes.tuple;
    items: T;
}
export declare class ZodTuple<T extends [z.ZodTypeAny, ...z.ZodTypeAny[]] | [] = [z.ZodTypeAny, ...z.ZodTypeAny[]]> extends z.ZodType<OutputTypeOfTuple<T>, ZodTupleDef<T>, InputTypeOfTuple<T>> {
    toJSON: () => {
        t: z.ZodTypes.tuple;
        items: any[];
    };
    get items(): T;
    static create: <T_1 extends [] | [z.ZodTypeAny, ...z.ZodTypeAny[]]>(schemas: T_1) => ZodTuple<T_1>;
}
