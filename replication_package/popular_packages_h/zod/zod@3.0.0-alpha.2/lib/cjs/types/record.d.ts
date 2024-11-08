import * as z from "./base";
export interface ZodRecordDef<Value extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.record;
    valueType: Value;
}
export declare class ZodRecord<Value extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodType<Record<string, Value["_output"]>, ZodRecordDef<Value>, Record<string, Value["_input"]>> {
    readonly _value: Value;
    toJSON: () => {
        t: z.ZodTypes.record;
        valueType: object;
    };
    static create: <Value_1 extends z.ZodTypeAny = z.ZodTypeAny>(valueType: Value_1) => ZodRecord<Value_1>;
}
