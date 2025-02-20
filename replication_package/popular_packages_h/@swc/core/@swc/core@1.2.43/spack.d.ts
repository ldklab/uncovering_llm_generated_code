import { Options } from "./types";
export declare type BundleInput = BundleOptions | BundleOptions[];
export declare function compileBundleOptions(config: BundleInput | string | undefined): Promise<BundleInput>;
/**
 * Usage: In `spack.config.js` / `spack.config.ts`, you can utilize type annotations (to get autocompletions) like
 *
 * ```ts
 * import { config } from '@swc/core/spack';
 *
 * export default config({
 *      name: 'web',
 * });
 * ```
 *
 *
 *
 */
export declare function config(c: BundleInput): BundleInput;
export interface BundleOptions extends SpackConfig {
    workingDir?: string;
}
/**
 * `spack.config,js`
 */
export interface SpackConfig {
    /**
     * @default process.env.NODE_ENV
     */
    mode?: Mode;
    entry: EntryConfig;
    output: OutputConfig;
    module: ModuleConfig;
    options?: Options;
}
export interface OutputConfig {
    name: string;
    path: string;
}
export interface ModuleConfig {
}
export declare type Mode = 'production' | 'development' | 'none';
export declare type EntryConfig = string | string[] | {
    [name: string]: string;
};
