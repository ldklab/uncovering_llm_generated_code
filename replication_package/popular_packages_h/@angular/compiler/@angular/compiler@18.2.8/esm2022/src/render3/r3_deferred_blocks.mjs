/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as html from '../ml_parser/ast';
import { ParseError, ParseSourceSpan } from '../parse_util';
import * as t from './r3_ast';
import { getTriggerParametersStart, parseDeferredTime, parseOnTrigger, parseWhenTrigger, } from './r3_deferred_triggers';
/** Pattern to identify a `prefetch when` trigger. */
const PREFETCH_WHEN_PATTERN = /^prefetch\s+when\s/;
/** Pattern to identify a `prefetch on` trigger. */
const PREFETCH_ON_PATTERN = /^prefetch\s+on\s/;
/** Pattern to identify a `minimum` parameter in a block. */
const MINIMUM_PARAMETER_PATTERN = /^minimum\s/;
/** Pattern to identify a `after` parameter in a block. */
const AFTER_PARAMETER_PATTERN = /^after\s/;
/** Pattern to identify a `when` parameter in a block. */
const WHEN_PARAMETER_PATTERN = /^when\s/;
/** Pattern to identify a `on` parameter in a block. */
const ON_PARAMETER_PATTERN = /^on\s/;
/**
 * Predicate function that determines if a block with
 * a specific name cam be connected to a `defer` block.
 */
export function isConnectedDeferLoopBlock(name) {
    return name === 'placeholder' || name === 'loading' || name === 'error';
}
/** Creates a deferred block from an HTML AST node. */
export function createDeferredBlock(ast, connectedBlocks, visitor, bindingParser) {
    const errors = [];
    const { placeholder, loading, error } = parseConnectedBlocks(connectedBlocks, errors, visitor);
    const { triggers, prefetchTriggers } = parsePrimaryTriggers(ast.parameters, bindingParser, errors, placeholder);
    // The `defer` block has a main span encompassing all of the connected branches as well.
    let lastEndSourceSpan = ast.endSourceSpan;
    let endOfLastSourceSpan = ast.sourceSpan.end;
    if (connectedBlocks.length > 0) {
        const lastConnectedBlock = connectedBlocks[connectedBlocks.length - 1];
        lastEndSourceSpan = lastConnectedBlock.endSourceSpan;
        endOfLastSourceSpan = lastConnectedBlock.sourceSpan.end;
    }
    const sourceSpanWithConnectedBlocks = new ParseSourceSpan(ast.sourceSpan.start, endOfLastSourceSpan);
    const node = new t.DeferredBlock(html.visitAll(visitor, ast.children, ast.children), triggers, prefetchTriggers, placeholder, loading, error, ast.nameSpan, sourceSpanWithConnectedBlocks, ast.sourceSpan, ast.startSourceSpan, lastEndSourceSpan, ast.i18n);
    return { node, errors };
}
function parseConnectedBlocks(connectedBlocks, errors, visitor) {
    let placeholder = null;
    let loading = null;
    let error = null;
    for (const block of connectedBlocks) {
        try {
            if (!isConnectedDeferLoopBlock(block.name)) {
                errors.push(new ParseError(block.startSourceSpan, `Unrecognized block "@${block.name}"`));
                break;
            }
            switch (block.name) {
                case 'placeholder':
                    if (placeholder !== null) {
                        errors.push(new ParseError(block.startSourceSpan, `@defer block can only have one @placeholder block`));
                    }
                    else {
                        placeholder = parsePlaceholderBlock(block, visitor);
                    }
                    break;
                case 'loading':
                    if (loading !== null) {
                        errors.push(new ParseError(block.startSourceSpan, `@defer block can only have one @loading block`));
                    }
                    else {
                        loading = parseLoadingBlock(block, visitor);
                    }
                    break;
                case 'error':
                    if (error !== null) {
                        errors.push(new ParseError(block.startSourceSpan, `@defer block can only have one @error block`));
                    }
                    else {
                        error = parseErrorBlock(block, visitor);
                    }
                    break;
            }
        }
        catch (e) {
            errors.push(new ParseError(block.startSourceSpan, e.message));
        }
    }
    return { placeholder, loading, error };
}
function parsePlaceholderBlock(ast, visitor) {
    let minimumTime = null;
    for (const param of ast.parameters) {
        if (MINIMUM_PARAMETER_PATTERN.test(param.expression)) {
            if (minimumTime != null) {
                throw new Error(`@placeholder block can only have one "minimum" parameter`);
            }
            const parsedTime = parseDeferredTime(param.expression.slice(getTriggerParametersStart(param.expression)));
            if (parsedTime === null) {
                throw new Error(`Could not parse time value of parameter "minimum"`);
            }
            minimumTime = parsedTime;
        }
        else {
            throw new Error(`Unrecognized parameter in @placeholder block: "${param.expression}"`);
        }
    }
    return new t.DeferredBlockPlaceholder(html.visitAll(visitor, ast.children, ast.children), minimumTime, ast.nameSpan, ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan, ast.i18n);
}
function parseLoadingBlock(ast, visitor) {
    let afterTime = null;
    let minimumTime = null;
    for (const param of ast.parameters) {
        if (AFTER_PARAMETER_PATTERN.test(param.expression)) {
            if (afterTime != null) {
                throw new Error(`@loading block can only have one "after" parameter`);
            }
            const parsedTime = parseDeferredTime(param.expression.slice(getTriggerParametersStart(param.expression)));
            if (parsedTime === null) {
                throw new Error(`Could not parse time value of parameter "after"`);
            }
            afterTime = parsedTime;
        }
        else if (MINIMUM_PARAMETER_PATTERN.test(param.expression)) {
            if (minimumTime != null) {
                throw new Error(`@loading block can only have one "minimum" parameter`);
            }
            const parsedTime = parseDeferredTime(param.expression.slice(getTriggerParametersStart(param.expression)));
            if (parsedTime === null) {
                throw new Error(`Could not parse time value of parameter "minimum"`);
            }
            minimumTime = parsedTime;
        }
        else {
            throw new Error(`Unrecognized parameter in @loading block: "${param.expression}"`);
        }
    }
    return new t.DeferredBlockLoading(html.visitAll(visitor, ast.children, ast.children), afterTime, minimumTime, ast.nameSpan, ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan, ast.i18n);
}
function parseErrorBlock(ast, visitor) {
    if (ast.parameters.length > 0) {
        throw new Error(`@error block cannot have parameters`);
    }
    return new t.DeferredBlockError(html.visitAll(visitor, ast.children, ast.children), ast.nameSpan, ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan, ast.i18n);
}
function parsePrimaryTriggers(params, bindingParser, errors, placeholder) {
    const triggers = {};
    const prefetchTriggers = {};
    for (const param of params) {
        // The lexer ignores the leading spaces so we can assume
        // that the expression starts with a keyword.
        if (WHEN_PARAMETER_PATTERN.test(param.expression)) {
            parseWhenTrigger(param, bindingParser, triggers, errors);
        }
        else if (ON_PARAMETER_PATTERN.test(param.expression)) {
            parseOnTrigger(param, triggers, errors, placeholder);
        }
        else if (PREFETCH_WHEN_PATTERN.test(param.expression)) {
            parseWhenTrigger(param, bindingParser, prefetchTriggers, errors);
        }
        else if (PREFETCH_ON_PATTERN.test(param.expression)) {
            parseOnTrigger(param, prefetchTriggers, errors, placeholder);
        }
        else {
            errors.push(new ParseError(param.sourceSpan, 'Unrecognized trigger'));
        }
    }
    return { triggers, prefetchTriggers };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfZGVmZXJyZWRfYmxvY2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfZGVmZXJyZWRfYmxvY2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxJQUFJLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxFQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHMUQsT0FBTyxLQUFLLENBQUMsTUFBTSxVQUFVLENBQUM7QUFDOUIsT0FBTyxFQUNMLHlCQUF5QixFQUN6QixpQkFBaUIsRUFDakIsY0FBYyxFQUNkLGdCQUFnQixHQUNqQixNQUFNLHdCQUF3QixDQUFDO0FBRWhDLHFEQUFxRDtBQUNyRCxNQUFNLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDO0FBRW5ELG1EQUFtRDtBQUNuRCxNQUFNLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO0FBRS9DLDREQUE0RDtBQUM1RCxNQUFNLHlCQUF5QixHQUFHLFlBQVksQ0FBQztBQUUvQywwREFBMEQ7QUFDMUQsTUFBTSx1QkFBdUIsR0FBRyxVQUFVLENBQUM7QUFFM0MseURBQXlEO0FBQ3pELE1BQU0sc0JBQXNCLEdBQUcsU0FBUyxDQUFDO0FBRXpDLHVEQUF1RDtBQUN2RCxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQztBQUVyQzs7O0dBR0c7QUFDSCxNQUFNLFVBQVUseUJBQXlCLENBQUMsSUFBWTtJQUNwRCxPQUFPLElBQUksS0FBSyxhQUFhLElBQUksSUFBSSxLQUFLLFNBQVMsSUFBSSxJQUFJLEtBQUssT0FBTyxDQUFDO0FBQzFFLENBQUM7QUFFRCxzREFBc0Q7QUFDdEQsTUFBTSxVQUFVLG1CQUFtQixDQUNqQyxHQUFlLEVBQ2YsZUFBNkIsRUFDN0IsT0FBcUIsRUFDckIsYUFBNEI7SUFFNUIsTUFBTSxNQUFNLEdBQWlC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QU0sQ0FBQyxDQUFDO1FBQ25FLENBQUM7YUFBTSxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUN0RCxjQUFjLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMvRCxDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7UUFDeEUsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLEVBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFDLENBQUM7QUFDdEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7UGFyc2VFcnJvciwgUGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi9wYXJzZV91dGlsJztcbmltcG9ydCB7QmluZGluZ1BhcnNlcn0gZnJvbSAnLi4vdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyJztcblxuaW1wb3J0ICogYXMgdCBmcm9tICcuL3IzX2FzdCc7XG5pbXBvcnQge1xuICBnZXRUcmlnZ2VyUGFyYW1ldGVyc1N0YXJ0LFxuICBwYXJzZURlZmVycmVkVGltZSxcbiAgcGFyc2VPblRyaWdnZXIsXG4gIHBhcnNlV2hlblRyaWdnZXIsXG59IGZyb20gJy4vcjNfZGVmZXJyZWRfdHJpZ2dlcnMnO1xuXG4vKiogUGF0dGVybiB0byBpZGVudGlmeSBhIGBwcmVmZXRjaCB3aGVuYCB0cmlnZ2VyLiAqL1xuY29uc3QgUFJFRkVUQ0hfV0hFTl9QQVRURVJOID0gL15wcmVmZXRjaFxccyt3aGVuXFxzLztcblxuLyoqIFBhdHRlcm4gdG8gaWRlbnRpZnkgYSBgcHJlZmV0Y2ggb25gIHRyaWdnZXIuICovXG5jb25zdCBQUkVGRVRDSF9PTl9QQVRURVJOID0gL15wcmVmZXRjaFxccytvblxccy87XG5cbi8qKiBQYXR0ZXJuIHRvIGlkZW50aWZ5IGEgYG1pbmltdW1gIHBhcmFtZXRlciBpbiBhIGJsb2NrLiAqL1xuY29uc3QgTUlOSU1VTV9QQVJBTUVURVJfUEFUVEVSTiA9IC9ebWluaW11bVxccy87XG5cbi8qKiBQYXR0ZXJuIHRvIGlkZW50aWZ5IGEgYGFmdGVyYCBwYXJhbWV0ZXIgaW4gYSBibG9jay4gKi9cbmNvbnN0IEFGVEVSX1BBUkFNRVRFUl9QQVRURVJOID0gL15hZnRlclxccy87XG5cbi8qKiBQYXR0ZXJuIHRvIGlkZW50aWZ5IGEgYHdoZW5gIHBhcmFtZXRlciBpbiBhIGJsb2NrLiAqL1xuY29uc3QgV0hFTl9QQVJBTUVURVJfUEFUVEVSTiA9IC9ed2hlblxccy87XG5cbi8qKiBQYXR0ZXJuIHRvIGlkZW50aWZ5IGEgYG9uYCBwYXJhbWV0ZXIgaW4gYSBibG9jay4gKi9cbmNvbnN0IE9OX1BBUkFNRVRFUl9QQVRURVJOID0gL15vblxccy87XG5cbi8qKlxuICogUHJlZGljYXRlIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyBpZiBhIGJsb2NrIHdpdGhcbiAqIGEgc3BlY2lmaWMgbmFtZSBjYW0gYmUgY29ubmVjdGVkIHRvIGEgYGRlZmVyYCBibG9jay5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ29ubmVjdGVkRGVmZXJMb29wQmxvY2sobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBuYW1lID09PSAncGxhY2Vob2xkZXInIHx8IG5hbWUgPT09ICdsb2FkaW5nJyB8fCBuYW1lID09PSAnZXJyb3InO1xufVxuXG4vKiogQ3JlYXRlcyBhIGRlZmVycmVkIGJsb2NrIGZyb20gYW4gSFRNTCBBU1Qgbm9kZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEZWZlcnJlZEJsb2NrKFxuICBhc3Q6IGh0bWwuQmxvY2ssXG4gIGNvbm5lY3RlZEJsb2NrczogaHRtbC5CbG9ja1tdLFxuICB2aXNpdG9yOiBodG1sLlZpc2l0b3IsXG4gIGJpbmRpbmdQYXJzZXI6IEJpbmRpbmdQYXJzZXIsXG4pOiB7bm9kZTogdC5EZWZlcnJlZEJsb2NrOyBlcnJvcnM6IFBhcnNlRXJyb3JbXX0ge1xuICBjb25zdCBlcnJvcnM6IFBhcnNlRXJyb3JbXSA9IFtdO1xuICBjb25zdCB7cGxhY2Vob2xkZXIsIGxvYWRpbmcsIGVycm9yfSA9IHBhcnNlQ29ubmVjdGVkQmxvY2tzKGNvbm5lY3RlZEJsb2NrcywgZXJyb3JzLCB2aXNpdG9yKTtcbiAgY29uc3Qge3RyaWdnZXJzLCBwcmVmZXRjaFRyaWdnZXJzfSA9IHBhcnNlUHJpbWFyeVRyaWdnZXJzKFxuICAgIGFzdC5wYXJhbWV0ZXJzLFxuICAgIGJpbmRpbmdQYXJzZXIsXG4gICAgZXJyb3JzLFxuICAgIHBsYWNlaG9sZGVyLFxuICApO1xuXG4gIC8vIFRoZSBgZGVmZXJgIGJsb2NrIGhhcyBhIG1haW4gc3BhbiBlbmNvbXBhc3NpbmcgYWxsIG9mIHRoZSBjb25uZWN0ZWQgYnJhbmNoZXMgYXMgd2VsbC5cbiAgbGV0IGxhc3RFbmRTb3VyY2VTcGFuID0gYXN0LmVuZFNvdXJjZVNwYW47XG4gIGxldCBlbmRPZkxhc3RTb3VyY2VTcGFuID0gYXN0LnNvdXJjZVNwYW4uZW5kO1xuICBpZiAoY29ubmVjdGVkQmxvY2tzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBsYXN0Q29ubmVjdGVkQmxvY2sgPSBjb25uZWN0ZWRCbG9ja3NbY29ubmVjdGVkQmxvY2tzLmxlbmd0aCAtIDFdO1xuICAgIGxhc3RFbmRTb3VyY2VTcGFuID0gbGFzdENvbm5lY3RlZEJsb2NrLmVuZFNvdXJjZVNwYW47XG4gICAgZW5kT2ZMYXN0U291cmNlU3BhbiA9IGxhc3RDb25uZWN0ZWRCbG9jay5zb3VyY2VTcGFuLmVuZDtcbiAgfVxuXG4gIGNvbnN0IHNvdXJjZVNwYW5XaXRoQ29ubmVjdGVkQmxvY2tzID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICBhc3Quc291cmNlU3Bhbi5zdGFydCxcbiAgICBlbmRPZkxhc3RTb3VyY2VTcGFuLFxuICApO1xuXG4gIGNvbnN0IG5vZGUgPSBuZXcgdC5EZWZlcnJlZEJsb2NrKFxuICAgIGh0bWwudmlzaXRBbGwodmlzaXRvciwgYXN0LmNoaWxkcmVuLCBhc3QuY2hpbGRyZW4pLFxuICAgIHRyaWdnZXJzLFxuICAgIHByZWZldGNoVHJpZ2dlcnMsXG4gICAgcGxhY2Vob2xkZXIsXG4gICAgbG9hZGluZyxcbiAgICBlcnJvcixcbiAgICBhc3QubmFtZVNwYW4sXG4gICAgc291cmNlU3BhbldpdGhDb25uZWN0ZWRCbG9ja3MsXG4gICAgYXN0LnNvdXJjZVNwYW4sXG4gICAgYXN0LnN0YXJ0U291cmNlU3BhbixcbiAgICBsYXN0RW5kU291cmNlU3BhbixcbiAgICBhc3QuaTE4bixcbiAgKTtcblxuICByZXR1cm4ge25vZGUsIGVycm9yc307XG59XG5cbmZ1bmN0aW9uIHBhcnNlQ29ubmVjdGVkQmxvY2tzKFxuICBjb25uZWN0ZWRCbG9ja3M6IGh0bWwuQmxvY2tbXSxcbiAgZXJyb3JzOiBQYXJzZUVycm9yW10sXG4gIHZpc2l0b3I6IGh0bWwuVmlzaXRvcixcbikge1xuICBsZXQgcGxhY2Vob2xkZXI6IHQuRGVmZXJyZWRCbG9ja1BsYWNlaG9sZGVyIHwgbnVsbCA9IG51bGw7XG4gIGxldCBsb2FkaW5nOiB0LkRlZmVycmVkQmxvY2tMb2FkaW5nIHwgbnVsbCA9IG51bGw7XG4gIGxldCBlcnJvcjogdC5EZWZlcnJlZEJsb2NrRXJyb3IgfCBudWxsID0gbnVsbDtcblxuICBmb3IgKGNvbnN0IGJsb2NrIG9mIGNvbm5lY3RlZEJsb2Nrcykge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWlzQ29ubmVjdGVkRGVmZXJMb29wQmxvY2soYmxvY2submFtZSkpIHtcbiAgICAgICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IoYmxvY2suc3RhcnRTb3VyY2VTcGFuLCBgVW5yZWNvZ25pemVkIGJsb2NrIFwiQCR7YmxvY2submFtZX1cImApKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAoYmxvY2submFtZSkge1xuICAgICAgICBjYXNlICdwbGFjZWhvbGRlcic6XG4gICAgICAgICAgaWYgKHBsYWNlaG9sZGVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICAgICAgbmV3IFBhcnNlRXJyb3IoXG4gICAgICAgICAgICAgICAgYmxvY2suc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgIGBAZGVmZXIgYmxvY2sgY2FuIG9ubHkgaGF2ZSBvbmUgQHBsYWNlaG9sZGVyIGJsb2NrYCxcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gcGFyc2VQbGFjZWhvbGRlckJsb2NrKGJsb2NrLCB2aXNpdG9yKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbG9hZGluZyc6XG4gICAgICAgICAgaWYgKGxvYWRpbmcgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgICAgICBuZXcgUGFyc2VFcnJvcihcbiAgICAgICAgICAgICAgICBibG9jay5zdGFydFNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgYEBkZWZlciBibG9jayBjYW4gb25seSBoYXZlIG9uZSBAbG9hZGluZyBibG9ja2AsXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2FkaW5nID0gcGFyc2VMb2FkaW5nQmxvY2soYmxvY2ssIHZpc2l0b3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgaWYgKGVycm9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICAgICAgbmV3IFBhcnNlRXJyb3IoYmxvY2suc3RhcnRTb3VyY2VTcGFuLCBgQGRlZmVyIGJsb2NrIGNhbiBvbmx5IGhhdmUgb25lIEBlcnJvciBibG9ja2ApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3IgPSBwYXJzZUVycm9yQmxvY2soYmxvY2ssIHZpc2l0b3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcihibG9jay5zdGFydFNvdXJjZVNwYW4sIChlIGFzIEVycm9yKS5tZXNzYWdlKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtwbGFjZWhvbGRlciwgbG9hZGluZywgZXJyb3J9O1xufVxuXG5mdW5jdGlvbiBwYXJzZVBsYWNlaG9sZGVyQmxvY2soYXN0OiBodG1sLkJsb2NrLCB2aXNpdG9yOiBodG1sLlZpc2l0b3IpOiB0LkRlZmVycmVkQmxvY2tQbGFjZWhvbGRlciB7XG4gIGxldCBtaW5pbXVtVGltZTogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgZm9yIChjb25zdCBwYXJhbSBvZiBhc3QucGFyYW1ldGVycykge1xuICAgIGlmIChNSU5JTVVNX1BBUkFNRVRFUl9QQVRURVJOLnRlc3QocGFyYW0uZXhwcmVzc2lvbikpIHtcbiAgICAgIGlmIChtaW5pbXVtVGltZSAhPSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQHBsYWNlaG9sZGVyIGJsb2NrIGNhbiBvbmx5IGhhdmUgb25lIFwibWluaW11bVwiIHBhcmFtZXRlcmApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXJzZWRUaW1lID0gcGFyc2VEZWZlcnJlZFRpbWUoXG4gICAgICAgIHBhcmFtLmV4cHJlc3Npb24uc2xpY2UoZ2V0VHJpZ2dlclBhcmFtZXRlcnNTdGFydChwYXJhbS5leHByZXNzaW9uKSksXG4gICAgICApO1xuXG4gICAgICBpZiAocGFyc2VkVGltZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBwYXJzZSB0aW1lIHZhbHVlIG9mIHBhcmFtZXRlciBcIm1pbmltdW1cImApO1xuICAgICAgfVxuXG4gICAgICBtaW5pbXVtVGltZSA9IHBhcnNlZFRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIHBhcmFtZXRlciBpbiBAcGxhY2Vob2xkZXIgYmxvY2s6IFwiJHtwYXJhbS5leHByZXNzaW9ufVwiYCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyB0LkRlZmVycmVkQmxvY2tQbGFjZWhvbGRlcihcbiAgICBodG1sLnZpc2l0QWxsKHZpc2l0b3IsIGFzdC5jaGlsZHJlbiwgYXN0LmNoaWxkcmVuKSxcbiAgICBtaW5pbXVtVGltZSxcbiAgICBhc3QubmFtZVNwYW4sXG4gICAgYXN0LnNvdXJjZVNwYW4sXG4gICAgYXN0LnN0YXJ0U291cmNlU3BhbixcbiAgICBhc3QuZW5kU291cmNlU3BhbixcbiAgICBhc3QuaTE4bixcbiAgKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VMb2FkaW5nQmxvY2soYXN0OiBodG1sLkJsb2NrLCB2aXNpdG9yOiBodG1sLlZpc2l0b3IpOiB0LkRlZmVycmVkQmxvY2tMb2FkaW5nIHtcbiAgbGV0IGFmdGVyVGltZTogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gIGxldCBtaW5pbXVtVGltZTogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgZm9yIChjb25zdCBwYXJhbSBvZiBhc3QucGFyYW1ldGVycykge1xuICAgIGlmIChBRlRFUl9QQVJBTUVURVJfUEFUVEVSTi50ZXN0KHBhcmFtLmV4cHJlc3Npb24pKSB7XG4gICAgICBpZiAoYWZ0ZXJUaW1lICE9IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBAbG9hZGluZyBibG9jayBjYW4gb25seSBoYXZlIG9uZSBcImFmdGVyXCIgcGFyYW1ldGVyYCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcnNlZFRpbWUgPSBwYXJzZURlZmVycmVkVGltZShcbiAgICAgICAgcGFyYW0uZXhwcmVzc2lvbi5zbGljZShnZXRUcmlnZ2VyUGFyYW1ldGVyc1N0YXJ0KHBhcmFtLmV4cHJlc3Npb24pKSxcbiAgICAgICk7XG5cbiAgICAgIGlmIChwYXJzZWRUaW1lID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHBhcnNlIHRpbWUgdmFsdWUgb2YgcGFyYW1ldGVyIFwiYWZ0ZXJcImApO1xuICAgICAgfVxuXG4gICAgICBhZnRlclRpbWUgPSBwYXJzZWRUaW1lO1xuICAgIH0gZWxzZSBpZiAoTUlOSU1VTV9QQVJBTUVURVJfUEFUVEVSTi50ZXN0KHBhcmFtLmV4cHJlc3Npb24pKSB7XG4gICAgICBpZiAobWluaW11bVRpbWUgIT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEBsb2FkaW5nIGJsb2NrIGNhbiBvbmx5IGhhdmUgb25lIFwibWluaW11bVwiIHBhcmFtZXRlcmApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXJzZWRUaW1lID0gcGFyc2VEZWZlcnJlZFRpbWUoXG4gICAgICAgIHBhcmFtLmV4cHJlc3Npb24uc2xpY2UoZ2V0VHJpZ2dlclBhcmFtZXRlcnNTdGFydChwYXJhbS5leHByZXNzaW9uKSksXG4gICAgICApO1xuXG4gICAgICBpZiAocGFyc2VkVGltZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBwYXJzZSB0aW1lIHZhbHVlIG9mIHBhcmFtZXRlciBcIm1pbmltdW1cImApO1xuICAgICAgfVxuXG4gICAgICBtaW5pbXVtVGltZSA9IHBhcnNlZFRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIHBhcmFtZXRlciBpbiBAbG9hZGluZyBibG9jazogXCIke3BhcmFtLmV4cHJlc3Npb259XCJgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IHQuRGVmZXJyZWRCbG9ja0xvYWRpbmcoXG4gICAgaHRtbC52aXNpdEFsbCh2aXNpdG9yLCBhc3QuY2hpbGRyZW4sIGFzdC5jaGlsZHJlbiksXG4gICAgYWZ0ZXJUaW1lLFxuICAgIG1pbmltdW1UaW1lLFxuICAgIGFzdC5uYW1lU3BhbixcbiAgICBhc3Quc291cmNlU3BhbixcbiAgICBhc3Quc3RhcnRTb3VyY2VTcGFuLFxuICAgIGFzdC5lbmRTb3VyY2VTcGFuLFxuICAgIGFzdC5pMThuLFxuICApO1xufVxuXG5mdW5jdGlvbiBwYXJzZUVycm9yQmxvY2soYXN0OiBodG1sLkJsb2NrLCB2aXNpdG9yOiBodG1sLlZpc2l0b3IpOiB0LkRlZmVycmVkQmxvY2tFcnJvciB7XG4gIGlmIChhc3QucGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBAZXJyb3IgYmxvY2sgY2Fubm90IGhhdmUgcGFyYW1ldGVyc2ApO1xuICB9XG5cbiAgcmV0dXJuIG5ldyB0LkRlZmVycmVkQmxvY2tFcnJvcihcbiAgICBodG1sLnZpc2l0QWxsKHZpc2l0b3IsIGFzdC5jaGlsZHJlbiwgYXN0LmNoaWxkcmVuKSxcbiAgICBhc3QubmFtZVNwYW4sXG4gICAgYXN0LnNvdXJjZVNwYW4sXG4gICAgYXN0LnN0YXJ0U291cmNlU3BhbixcbiAgICBhc3QuZW5kU291cmNlU3BhbixcbiAgICBhc3QuaTE4bixcbiAgKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VQcmltYXJ5VHJpZ2dlcnMoXG4gIHBhcmFtczogaHRtbC5CbG9ja1BhcmFtZXRlcltdLFxuICBiaW5kaW5nUGFyc2VyOiBCaW5kaW5nUGFyc2VyLFxuICBlcnJvcnM6IFBhcnNlRXJyb3JbXSxcbiAgcGxhY2Vob2xkZXI6IHQuRGVmZXJyZWRCbG9ja1BsYWNlaG9sZGVyIHwgbnVsbCxcbikge1xuICBjb25zdCB0cmlnZ2VyczogdC5EZWZlcnJlZEJsb2NrVHJpZ2dlcnMgPSB7fTtcbiAgY29uc3QgcHJlZmV0Y2hUcmlnZ2VyczogdC5EZWZlcnJlZEJsb2NrVHJpZ2dlcnMgPSB7fTtcblxuICBmb3IgKGNvbnN0IHBhcmFtIG9mIHBhcmFtcykge1xuICAgIC8vIFRoZSBsZXhlciBpZ25vcmVzIHRoZSBsZWFkaW5nIHNwYWNlcyBzbyB3ZSBjYW4gYXNzdW1lXG4gICAgLy8gdGhhdCB0aGUgZXhwcmVzc2lvbiBzdGFydHMgd2l0aCBhIGtleXdvcmQuXG4gICAgaWYgKFdIRU5fUEFSQU1FVEVSX1BBVFRFUk4udGVzdChwYXJhbS5leHByZXNzaW9uKSkge1xuICAgICAgcGFyc2VXaGVuVHJpZ2dlcihwYXJhbSwgYmluZGluZ1BhcnNlciwgdHJpZ2dlcnMsIGVycm9ycyk7XG4gICAgfSBlbHNlIGlmIChPTl9QQVJBTUVURVJfUEFUVEVSTi50ZXN0KHBhcmFtLmV4cHJlc3Npb24pKSB7XG4gICAgICBwYXJzZU9uVHJpZ2dlcihwYXJhbSwgdHJpZ2dlcnMsIGVycm9ycywgcGxhY2Vob2xkZXIpO1xuICAgIH0gZWxzZSBpZiAoUFJFRkVUQ0hfV0hFTl9QQVRURVJOLnRlc3QocGFyYW0uZXhwcmVzc2lvbikpIHtcbiAgICAgIHBhcnNlV2hlblRyaWdnZXIocGFyYW0sIGJpbmRpbmdQYXJzZXIsIHByZWZldGNoVHJpZ2dlcnMsIGVycm9ycyk7XG4gICAgfSBlbHNlIGlmIChQUkVGRVRDSF9PTl9QQVRURVJOLnRlc3QocGFyYW0uZXhwcmVzc2lvbikpIHtcbiAgICAgIHBhcnNlT25UcmlnZ2VyKHBhcmFtLCBwcmVmZXRjaFRyaWdnZXJzLCBlcnJvcnMsIHBsYWNlaG9sZGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JzLnB1c2gobmV3IFBhcnNlRXJyb3IocGFyYW0uc291cmNlU3BhbiwgJ1VucmVjb2duaXplZCB0cmlnZ2VyJykpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7dHJpZ2dlcnMsIHByZWZldGNoVHJpZ2dlcnN9O1xufVxuIl19