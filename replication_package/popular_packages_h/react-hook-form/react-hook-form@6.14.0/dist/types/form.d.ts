import * as React from 'react';
import { LiteralToPrimitive, DeepPartial, DeepMap } from './utils';
import { Resolver } from './resolvers';
import { Field, FieldElement, FieldName, FieldRefs, FieldValue, FieldValues, InternalFieldName, Ref } from './fields';
import { ErrorOption, FieldErrors } from './errors';
import { RegisterOptions } from './validator';
import { ControllerRenderProps } from './props';
import { FieldArrayDefaultValues } from './fieldArray';
declare const $NestedValue: unique symbol;
export declare type NestedValue<TValue extends unknown[] | Record<string, unknown> | Map<unknown, unknown> = unknown[] | Record<string, unknown>> = {
    [$NestedValue]: never;
} & TValue;
export declare type Message = string;
export declare type UnpackNestedValue<T> = T extends NestedValue<infer U> ? U : T extends Date | FileList ? T : T extends Record<string, unknown> ? {
    [K in keyof T]: UnpackNestedValue<T[K]>;
} : T;
export declare type DefaultValues<TFieldValues> = UnpackNestedValue<DeepPartial<TFieldValues>>;
export declare type InternalNameSet<FieldValues> = Set<InternalFieldName<FieldValues>>;
export declare type RecordInternalNameSet<TFieldValues> = Record<string, InternalNameSet<TFieldValues>>;
export declare type ValidationMode = {
    onBlur: 'onBlur';
    onChange: 'onChange';
    onSubmit: 'onSubmit';
    onTouched: 'onTouched';
    all: 'all';
};
export declare type Mode = keyof ValidationMode;
export declare type SubmitHandler<TFieldValues extends FieldValues> = (data: UnpackNestedValue<TFieldValues>, event?: React.BaseSyntheticEvent) => any | Promise<any>;
export declare type SubmitErrorHandler<TFieldValues extends FieldValues> = (errors: FieldErrors<TFieldValues>, event?: React.BaseSyntheticEvent) => any | Promise<any>;
export declare type SetValueConfig = Partial<{
    shouldValidate: boolean;
    shouldDirty: boolean;
}>;
export declare type HandleChange = (event: Event) => Promise<void | boolean>;
export declare type UseFormOptions<TFieldValues extends FieldValues = FieldValues, TContext extends object = object> = Partial<{
    mode: Mode;
    reValidateMode: Exclude<Mode, 'onTouched' | 'all'>;
    defaultValues: DefaultValues<TFieldValues>;
    resolver: Resolver<TFieldValues, TContext>;
    context: TContext;
    shouldFocusError: boolean;
    shouldUnregister: boolean;
    criteriaMode: 'firstError' | 'all';
}>;
export declare type FieldNamesMarkedBoolean<TFieldValues extends FieldValues> = DeepMap<TFieldValues, true>;
export declare type FormStateProxy<TFieldValues extends FieldValues = FieldValues> = {
    isDirty: boolean;
    isValidating: boolean;
    dirtyFields: FieldNamesMarkedBoolean<TFieldValues>;
    touched: FieldNamesMarkedBoolean<TFieldValues>;
    isSubmitting: boolean;
    isValid: boolean;
};
export declare type ReadFormState = {
    [K in keyof FormStateProxy]: boolean;
};
export declare type FormState<TFieldValues> = {
    isDirty: boolean;
    dirtyFields: FieldNamesMarkedBoolean<TFieldValues>;
    isSubmitted: boolean;
    isSubmitSuccessful: boolean;
    submitCount: number;
    touched: FieldNamesMarkedBoolean<TFieldValues>;
    isSubmitting: boolean;
    isValidating: boolean;
    isValid: boolean;
    errors: FieldErrors<TFieldValues>;
};
export declare type OmitResetState = Partial<{
    errors: boolean;
    isDirty: boolean;
    isSubmitted: boolean;
    touched: boolean;
    isValid: boolean;
    submitCount: boolean;
    dirtyFields: boolean;
}>;
export declare type Control<TFieldValues extends FieldValues = FieldValues> = Pick<UseFormMethods<TFieldValues>, 'register' | 'unregister' | 'setValue' | 'getValues' | 'trigger'> & {
    isFormDirty: (name?: string, data?: unknown[]) => boolean;
    removeFieldEventListener: (field: Field, forceDelete?: boolean) => void;
    mode: Readonly<{
        isOnBlur: boolean;
        isOnSubmit: boolean;
        isOnChange: boolean;
        isOnAll: boolean;
        isOnTouch: boolean;
    }>;
    reValidateMode: Readonly<{
        isReValidateOnBlur: boolean;
        isReValidateOnChange: boolean;
    }>;
    fieldArrayDefaultValuesRef: FieldArrayDefaultValues;
    fieldArrayValuesRef: FieldArrayDefaultValues;
    shouldUnregister: boolean;
    formState: FormState<TFieldValues>;
    formStateRef: React.MutableRefObject<FormState<TFieldValues>>;
    updateFormState: (args?: Partial<FormState<TFieldValues>>) => void;
    validateResolver?: (fieldsValues: FieldValues) => void;
    validFieldsRef: React.MutableRefObject<FieldNamesMarkedBoolean<TFieldValues>>;
    fieldsWithValidationRef: React.MutableRefObject<FieldNamesMarkedBoolean<TFieldValues>>;
    fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>;
    resetFieldArrayFunctionRef: React.MutableRefObject<Record<InternalFieldName<TFieldValues>, () => void>>;
    shallowFieldsStateRef: React.MutableRefObject<Partial<TFieldValues>>;
    fieldArrayNamesRef: React.MutableRefObject<InternalNameSet<TFieldValues>>;
    readFormStateRef: React.MutableRefObject<{
        [k in keyof FormStateProxy<TFieldValues>]: boolean;
    }>;
    defaultValuesRef: React.MutableRefObject<DefaultValues<TFieldValues>>;
    useWatchFieldsRef: React.MutableRefObject<RecordInternalNameSet<TFieldValues>>;
    useWatchRenderFunctionsRef: React.MutableRefObject<Record<string, React.Dispatch<unknown>>>;
    watchInternal: (fieldNames?: string | string[], defaultValue?: unknown, watchId?: string) => unknown;
    updateWatchedValue: (name: string) => void;
};
export declare type UseWatchRenderFunctions = Record<string, () => void>;
export declare type UseWatchOptions<TFieldValues extends FieldValues = FieldValues> = {
    defaultValue?: unknown;
    name?: string | string[];
    control?: Control<TFieldValues>;
};
export declare type SetFieldValue<TFieldValues> = FieldValue<TFieldValues> | UnpackNestedValue<DeepPartial<TFieldValues>> | unknown[] | undefined | null | boolean;
export declare type InputState = {
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
};
export declare type UseFormMethods<TFieldValues extends FieldValues = FieldValues> = {
    register<TFieldElement extends FieldElement<TFieldValues>>(rules?: RegisterOptions): (ref: (TFieldElement & Ref) | null) => void;
    register(name: FieldName<TFieldValues>, rules?: RegisterOptions): void;
    register<TFieldElement extends FieldElement<TFieldValues>>(ref: (TFieldElement & Ref) | null, rules?: RegisterOptions): void;
    unregister(name: FieldName<TFieldValues> | FieldName<TFieldValues>[]): void;
    watch(): UnpackNestedValue<TFieldValues>;
    watch<TFieldName extends string, TFieldValue>(name: TFieldName, defaultValue?: TFieldName extends keyof TFieldValues ? UnpackNestedValue<TFieldValues[TFieldName]> : UnpackNestedValue<LiteralToPrimitive<TFieldValue>>): TFieldName extends keyof TFieldValues ? UnpackNestedValue<TFieldValues[TFieldName]> : UnpackNestedValue<LiteralToPrimitive<TFieldValue>>;
    watch<TFieldName extends keyof TFieldValues>(names: TFieldName[], defaultValues?: UnpackNestedValue<DeepPartial<Pick<TFieldValues, TFieldName>>>): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
    watch(names: string[], defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>): UnpackNestedValue<DeepPartial<TFieldValues>>;
    setError(name: FieldName<TFieldValues>, error: ErrorOption): void;
    clearErrors(name?: FieldName<TFieldValues> | FieldName<TFieldValues>[]): void;
    setValue(name: FieldName<TFieldValues>, value: SetFieldValue<TFieldValues>, config?: SetValueConfig): void;
    trigger(name?: FieldName<TFieldValues> | FieldName<TFieldValues>[]): Promise<boolean>;
    errors: FieldErrors<TFieldValues>;
    formState: FormState<TFieldValues>;
    reset: (values?: UnpackNestedValue<DeepPartial<TFieldValues>>, omitResetState?: OmitResetState) => void;
    getValues(): UnpackNestedValue<TFieldValues>;
    getValues<TFieldName extends string, TFieldValue extends unknown>(name: TFieldName): TFieldName extends keyof TFieldValues ? UnpackNestedValue<TFieldValues>[TFieldName] : TFieldValue;
    getValues<TFieldName extends keyof TFieldValues>(names: TFieldName[]): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
    handleSubmit: <TSubmitFieldValues extends FieldValues = TFieldValues>(onValid: SubmitHandler<TSubmitFieldValues>, onInvalid?: SubmitErrorHandler<TFieldValues>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
    control: Control<TFieldValues>;
};
export declare type UseControllerMethods<TFieldValues extends FieldValues = FieldValues> = {
    field: ControllerRenderProps<TFieldValues>;
    meta: InputState;
};
export {};
