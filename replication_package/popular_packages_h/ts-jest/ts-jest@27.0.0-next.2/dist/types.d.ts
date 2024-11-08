import type { TransformOptions } from '@jest/transform';
import type { Config } from '@jest/types';
import type * as _babel from 'babel__core';
import type * as _ts from 'typescript';
declare module '@jest/types' {
    namespace Config {
        interface ConfigGlobals {
            'ts-jest': TsJestGlobalOptions;
        }
    }
}
export declare type TTypeScript = typeof _ts;
export declare type BabelConfig = _babel.TransformOptions;
export interface AstTransformer<T = Record<string, unknown>> {
    path: string;
    options?: T;
}
export interface ConfigCustomTransformer {
    before?: (string | AstTransformer)[];
    after?: (string | AstTransformer)[];
    afterDeclarations?: (string | AstTransformer)[];
}
export interface TsJestGlobalOptions {
    tsconfig?: boolean | string | _ts.CompilerOptions;
    isolatedModules?: boolean;
    compiler?: string;
    astTransformers?: ConfigCustomTransformer;
    diagnostics?: boolean | {
        pretty?: boolean;
        ignoreCodes?: number | string | (number | string)[];
        pathRegex?: RegExp | string;
        warnOnly?: boolean;
    };
    babelConfig?: boolean | string | BabelConfig;
    stringifyContentPathRegex?: string | RegExp;
    useESM?: boolean;
}
export interface TsJestDiagnosticsCfg {
    pretty: boolean;
    ignoreCodes: number[];
    pathRegex?: string | undefined;
    throws: boolean;
    warnOnly?: boolean;
}
export interface ProjectConfigTsJest extends Config.ProjectConfig {
    globals: {
        'ts-jest': TsJestGlobalOptions;
    };
}
export interface TransformOptionsTsJest extends TransformOptions {
    config: ProjectConfigTsJest;
}
export declare type ResolvedModulesMap = Map<string, _ts.ResolvedModuleFull | undefined> | undefined;
export interface CompilerInstance {
    getResolvedModulesMap(fileContent: string, fileName: string): ResolvedModulesMap;
    getCompiledOutput(fileContent: string, fileName: string, supportsStaticESM: boolean): string;
}
