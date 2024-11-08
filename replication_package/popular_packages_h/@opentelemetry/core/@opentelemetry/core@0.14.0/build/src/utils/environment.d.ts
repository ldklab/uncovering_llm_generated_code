import { LogLevel } from '../common/types';
export declare type ENVIRONMENT_MAP = {
    [key: string]: string | number;
};
/**
 * Environment interface to define all names
 */
export interface ENVIRONMENT {
    OTEL_LOG_LEVEL?: LogLevel;
    OTEL_NO_PATCH_MODULES?: string;
    OTEL_SAMPLING_PROBABILITY?: number;
    OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT?: number;
    OTEL_SPAN_EVENT_COUNT_LIMIT?: number;
    OTEL_SPAN_LINK_COUNT_LIMIT?: number;
}
/**
 * Default environment variables
 */
export declare const DEFAULT_ENVIRONMENT: Required<ENVIRONMENT>;
/**
 * Parses environment values
 * @param values
 */
export declare function parseEnvironment(values: ENVIRONMENT_MAP): ENVIRONMENT;
//# sourceMappingURL=environment.d.ts.map