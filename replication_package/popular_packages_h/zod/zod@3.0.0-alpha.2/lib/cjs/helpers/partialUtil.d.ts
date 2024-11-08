import * as z from "../index";
import { AnyZodObject } from "../types/object";
export declare namespace partialUtil {
    type RootDeepPartial<T extends z.ZodTypeAny> = {
        object: T extends AnyZodObject ? z.ZodObject<{
            [k in keyof T["_shape"]]: DeepPartial<T["_shape"][k]>;
        }, T["_unknownKeys"], T["_catchall"]> : never;
        rest: ReturnType<T["optional"]>;
    }[T extends AnyZodObject ? "object" : "rest"];
    type DeepPartial<T extends z.ZodTypeAny> = {
        object: T extends z.ZodObject<infer Shape, infer Params, infer Catchall> ? z.ZodOptional<z.ZodObject<{
            [k in keyof Shape]: DeepPartial<Shape[k]>;
        }, Params, Catchall>> : never;
        rest: ReturnType<T["optional"]>;
    }[T extends z.ZodObject<any> ? "object" : "rest"];
}
