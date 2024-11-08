import locale from './locale';
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
declare type Locale = DeepPartial<typeof locale>;
export default function setLocale(custom: Locale): void;
export {};
