import type { TransformedSource, Transformer } from '@jest/transform';
import type { Config } from '@jest/types';
import type { Logger } from 'bs-logger';
import { ConfigSet } from './config/config-set';
import type { TransformOptionsTsJest } from './types';
export interface DepGraphInfo {
    fileContent: string;
    resolveModuleNames: string[];
}
export declare const CACHE_KEY_EL_SEPARATOR = "\0";
export declare class TsJestTransformer implements Transformer {
    protected readonly _logger: Logger;
    protected _tsResolvedModulesCachePath: string | undefined;
    protected _transformCfgStr: string;
    protected _depGraphs: Map<string, DepGraphInfo>;
    constructor();
    protected _configsFor(transformOptions: TransformOptionsTsJest): ConfigSet;
    process(fileContent: string, filePath: Config.Path, transformOptions: TransformOptionsTsJest): TransformedSource | string;
    getCacheKey(fileContent: string, filePath: string, transformOptions: TransformOptionsTsJest): string;
    protected _getFsCachedResolvedModules(configSet: ConfigSet): void;
}
