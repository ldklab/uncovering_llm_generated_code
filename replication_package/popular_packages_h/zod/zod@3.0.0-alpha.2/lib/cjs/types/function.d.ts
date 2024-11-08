import * as z from "./base";
import { ZodTuple } from "./tuple";
import { ZodUnknown } from "./unknown";
export interface ZodFunctionDef<Args extends ZodTuple<any> = ZodTuple<any>, Returns extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.function;
    args: Args;
    returns: Returns;
}
export declare type OuterTypeOfFunction<Args extends ZodTuple<any>, Returns extends z.ZodTypeAny> = Args["_input"] extends Array<any> ? (...args: Args["_input"]) => Returns["_output"] : never;
export declare type InnerTypeOfFunction<Args extends ZodTuple<any>, Returns extends z.ZodTypeAny> = Args["_output"] extends Array<any> ? (...args: Args["_output"]) => Returns["_input"] : never;
export declare class ZodFunction<Args extends ZodTuple<any>, Returns extends z.ZodTypeAny> extends z.ZodType<OuterTypeOfFunction<Args, Returns>, ZodFunctionDef, InnerTypeOfFunction<Args, Returns>> {
    readonly _def: ZodFunctionDef<Args, Returns>;
    args: <Items extends [] | [z.ZodTypeAny, ...z.ZodTypeAny[]]>(...items: Items) => ZodFunction<ZodTuple<Items>, Returns>;
    returns: <NewReturnType extends z.ZodType<any, any, any>>(returnType: NewReturnType) => ZodFunction<Args, NewReturnType>;
    implement: <F extends InnerTypeOfFunction<Args, Returns>>(func: F) => F;
    validate: <F extends InnerTypeOfFunction<Args, Returns>>(func: F) => F;
    static create: <T extends ZodTuple<any> = ZodTuple<[]>, U extends z.ZodTypeAny = ZodUnknown>(args?: T | undefined, returns?: U | undefined) => ZodFunction<T, U>;
    toJSON: () => {
        t: z.ZodTypes.function;
        args: {
            t: z.ZodTypes.tuple;
            items: any[];
        };
        returns: object;
    };
}
