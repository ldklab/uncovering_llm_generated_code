import { UseFieldArrayOptions, Control, UseFieldArrayMethods } from './types';
export declare const useFieldArray: <TFieldArrayValues extends Record<string, any> = Record<string, any>, TKeyName extends string = "id", TControl extends Control<Record<string, any>> = Control<Record<string, any>>>({ control, name, keyName, }: UseFieldArrayOptions<TKeyName, TControl>) => UseFieldArrayMethods<TFieldArrayValues, TKeyName>;