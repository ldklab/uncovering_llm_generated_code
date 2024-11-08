import type { Config } from '@jest/types';
export declare type TsJestPresets = Pick<Config.InitialOptions, 'extensionsToTreatAsEsm' | 'moduleFileExtensions' | 'transform' | 'testMatch'>;
export declare function createJestPreset(allowJs?: boolean, extraOptions?: Config.InitialOptions): TsJestPresets;
