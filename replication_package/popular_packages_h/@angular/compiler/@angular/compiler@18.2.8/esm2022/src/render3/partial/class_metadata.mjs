/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../output/output_ast';
import { compileComponentMetadataAsyncResolver, } from '../r3_class_metadata_compiler';
import { Identifiers as R3 } from '../r3_identifiers';
import { DefinitionMap } from '../view/util';
/**
 * Every time we make a breaking change to the declaration interface or partial-linker behavior, we
 * must update this constant to prevent old partial-linkers from incorrectly processing the
 * declaration.
 *
 * Do not include any prerelease in these versions as they are ignored.
 */
const MINIMUM_PARTIAL_LINKER_VERSION = '12.0.0';
/**
 * Minimum version at which deferred blocks are supported in the linker.
 */
const MINIMUM_PARTIAL_LINKER_DEFER_SUPPORT_VERSION = '18.0.0';
export function compileDeclareClassMetadata(metadata) {
    const definitionMap = new DefinitionMap();
    definitionMap.set('minVersion', o.literal(MINIMUM_PARTIAL_LINKER_VERSION));
    definitionMap.set('version', o.literal('18.2.8'));
    definitionMap.set('ngImport', o.importExpr(R3.core));
    definitionMap.set('type', metadata.type);
    definitionMap.set('decorators', metadata.decorators);
    definitionMap.set('ctorParameters', metadata.ctorParameters);
    definitionMap.set('propDecorators', metadata.propDecorators);
    return o.importExpr(R3.declareClassMetadata).callFn([definitionMap.toLiteralMap()]);
}
export function compileComponentDeclareClassMetadata(metadata, dependencies) {
    if (dependencies === null || dependencies.length === 0) {
        return compileDeclareClassMetadata(metadata);
    }
    const definitionMap = new DefinitionMap();
    const callbackReturnDefinitionMap = new DefinitionMap();
    callbackReturnDefinitionMap.set('decorators', metadata.decorators);
    callbackReturnDefinitionMap.set('ctorParameters', metadata.ctorParameters ?? o.literal(null));
    callbackReturnDefinitionMap.set('propDecorators', metadata.propDecorators ?? o.literal(null));
    definitionMap.set('minVersion', o.literal(MINIMUM_PARTIAL_LINKER_DEFER_SUPPORT_VERSION));
    definitionMap.set('version', o.literal('18.2.8'));
    definitionMap.set('ngImport', o.importExpr(R3.core));
    definitionMap.set('type', metadata.type);
    definitionMap.set('resolveDeferredDeps', compileComponentMetadataAsyncResolver(dependencies));
    definitionMap.set('resolveMetadata', o.arrowFn(dependencies.map((dep) => new o.FnParam(dep.symbolName, o.DYNAMIC_TYPE)), callbackReturnDefinitionMap.toLiteralMap()));
    return o.importExpr(R3.declareClassMetadataAsync).callFn([definitionMap.toLiteralMap()]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3NfbWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy9wYXJ0aWFsL2NsYXNzX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sS0FBSyxDQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDN0MsT0FBTyxFQUNMLHFDQUFxQyxHQUV0QyxNQUFNLCtCQUErQixDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxXQUFXLElBQUksRUFBRSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFcEQsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUkzQzs7Ozs7O0dBTUc7QUFDSCxNQUFNLDhCQUE4QixHQUFHLFFBQVEsQ0FBQztBQUVoRDs7R0FFRztBQUNILE1BQU0sNENBQTRDLEdBQUcsUUFBUSxDQUFDO0FBRTlELE1BQU0sVUFBVSwyQkFBMkIsQ0FBQyxRQUF5QjtJQUNuRSxNQUFNLGFBQWEsR0FBRyxJQUFJLGFBQWEsRUFBMEIsQ0FBQztJQUNsRSxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztJQUMzRSxhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztJQUM3RCxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3JELGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QyxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDckQsYUFBYSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDN0QsYUFBYSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFN0QsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdEYsQ0FBQztBQUVELE1BQU0sVUFBVSxvQ0FBb0MsQ0FDbEQsUUFBeUIsRUFDekIsWUFBb0Q7SUFFcEQsSUFBSSxZQUFZLEtBQUssSUFBSSxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDdkQsT0FBTywyQkFBMkIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsTUFBTSxhQUFhLEdBQUcsSUFBSSxhQUFhLEVBQStCLENBQUM7SUFDdkUsTUFBTSwyQkFBMkIsR0FBRyxJQUFJLGFBQWEsRUFBbUIsQ0FBQztJQUN6RSwyQkFBMkIsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuRSwyQkFBMkIsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDOUYsMkJBQTJCLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBRTlGLGFBQWEsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLGFBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0lBQzdELGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDckQsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pDLGFBQWEsQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUscUNBQXFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUM5RixhQUFhLENBQUMsR0FBRyxDQUNmLGlCQUFpQixFQUNqQixDQUFDLENBQUMsT0FBTyxDQUNQLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUN4RSwyQkFBMkIsQ0FBQyxZQUFZLEVBQUUsQ0FDM0MsQ0FDRixDQUFDO0lBRUYsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtcbiAgY29tcGlsZUNvbXBvbmVudE1ldGFkYXRhQXN5bmNSZXNvbHZlcixcbiAgUjNDbGFzc01ldGFkYXRhLFxufSBmcm9tICcuLi9yM19jbGFzc19tZXRhZGF0YV9jb21waWxlcic7XG5pbXBvcnQge0lkZW50aWZpZXJzIGFzIFIzfSBmcm9tICcuLi9yM19pZGVudGlmaWVycyc7XG5pbXBvcnQge1IzRGVmZXJQZXJDb21wb25lbnREZXBlbmRlbmN5fSBmcm9tICcuLi92aWV3L2FwaSc7XG5pbXBvcnQge0RlZmluaXRpb25NYXB9IGZyb20gJy4uL3ZpZXcvdXRpbCc7XG5cbmltcG9ydCB7UjNEZWNsYXJlQ2xhc3NNZXRhZGF0YSwgUjNEZWNsYXJlQ2xhc3NNZXRhZGF0YUFzeW5jfSBmcm9tICcuL2FwaSc7XG5cbi8qKlxuICogRXZlcnkgdGltZSB3ZSBtYWtlIGEgYnJlYWtpbmcgY2hhbmdlIHRvIHRoZSBkZWNsYXJhdGlvbiBpbnRlcmZhY2Ugb3IgcGFydGlhbC1saW5rZXIgYmVoYXZpb3IsIHdlXG4gKiBtdXN0IHVwZGF0ZSB0aGlzIGNvbnN0YW50IHRvIHByZXZlbnQgb2xkIHBhcnRpYWwtbGlua2VycyBmcm9tIGluY29ycmVjdGx5IHByb2Nlc3NpbmcgdGhlXG4gKiBkZWNsYXJhdGlvbi5cbiAqXG4gKiBEbyBub3QgaW5jbHVkZSBhbnkgcHJlcmVsZWFzZSBpbiB0aGVzZSB2ZXJzaW9ucyBhcyB0aGV5IGFyZSBpZ25vcmVkLlxuICovXG5jb25zdCBNSU5JTVVNX1BBUlRJQUxfTElOS0VSX1ZFUlNJT04gPSAnMTIuMC4wJztcblxuLyoqXG4gKiBNaW5pbXVtIHZlcnNpb24gYXQgd2hpY2ggZGVmZXJyZWQgYmxvY2tzIGFyZSBzdXBwb3J0ZWQgaW4gdGhlIGxpbmtlci5cbiAqL1xuY29uc3QgTUlOSU1VTV9QQVJUSUFMX0xJTktFUl9ERUZFUl9TVVBQT1JUX1ZFUlNJT04gPSAnMTguMC4wJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVEZWNsYXJlQ2xhc3NNZXRhZGF0YShtZXRhZGF0YTogUjNDbGFzc01ldGFkYXRhKTogby5FeHByZXNzaW9uIHtcbiAgY29uc3QgZGVmaW5pdGlvbk1hcCA9IG5ldyBEZWZpbml0aW9uTWFwPFIzRGVjbGFyZUNsYXNzTWV0YWRhdGE+KCk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCdtaW5WZXJzaW9uJywgby5saXRlcmFsKE1JTklNVU1fUEFSVElBTF9MSU5LRVJfVkVSU0lPTikpO1xuICBkZWZpbml0aW9uTWFwLnNldCgndmVyc2lvbicsIG8ubGl0ZXJhbCgnMC4wLjAtUExBQ0VIT0xERVInKSk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCduZ0ltcG9ydCcsIG8uaW1wb3J0RXhwcihSMy5jb3JlKSk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCd0eXBlJywgbWV0YWRhdGEudHlwZSk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCdkZWNvcmF0b3JzJywgbWV0YWRhdGEuZGVjb3JhdG9ycyk7XG4gIGRlZmluaXRpb25NYXAuc2V0KCdjdG9yUGFyYW1ldGVycycsIG1ldGFkYXRhLmN0b3JQYXJhbWV0ZXJzKTtcbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ3Byb3BEZWNvcmF0b3JzJywgbWV0YWRhdGEucHJvcERlY29yYXRvcnMpO1xuXG4gIHJldHVybiBvLmltcG9ydEV4cHIoUjMuZGVjbGFyZUNsYXNzTWV0YWRhdGEpLmNhbGxGbihbZGVmaW5pdGlvbk1hcC50b0xpdGVyYWxNYXAoKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUNvbXBvbmVudERlY2xhcmVDbGFzc01ldGFkYXRhKFxuICBtZXRhZGF0YTogUjNDbGFzc01ldGFkYXRhLFxuICBkZXBlbmRlbmNpZXM6IFIzRGVmZXJQZXJDb21wb25lbnREZXBlbmRlbmN5W10gfCBudWxsLFxuKTogby5FeHByZXNzaW9uIHtcbiAgaWYgKGRlcGVuZGVuY2llcyA9PT0gbnVsbCB8fCBkZXBlbmRlbmNpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGNvbXBpbGVEZWNsYXJlQ2xhc3NNZXRhZGF0YShtZXRhZGF0YSk7XG4gIH1cblxuICBjb25zdCBkZWZpbml0aW9uTWFwID0gbmV3IERlZmluaXRpb25NYXA8UjNEZWNsYXJlQ2xhc3NNZXRhZGF0YUFzeW5jPigpO1xuICBjb25zdCBjYWxsYmFja1JldHVybkRlZmluaXRpb25NYXAgPSBuZXcgRGVmaW5pdGlvbk1hcDxSM0NsYXNzTWV0YWRhdGE+KCk7XG4gIGNhbGxiYWNrUmV0dXJuRGVmaW5pdGlvbk1hcC5zZXQoJ2RlY29yYXRvcnMnLCBtZXRhZGF0YS5kZWNvcmF0b3JzKTtcbiAgY2FsbGJhY2tSZXR1cm5EZWZpbml0aW9uTWFwLnNldCgnY3RvclBhcmFtZXRlcnMnLCBtZXRhZGF0YS5jdG9yUGFyYW1ldGVycyA/PyBvLmxpdGVyYWwobnVsbCkpO1xuICBjYWxsYmFja1JldHVybkRlZmluaXRpb25NYXAuc2V0KCdwcm9wRGVjb3JhdG9ycycsIG1ldGFkYXRhLnByb3BEZWNvcmF0b3JzID8/IG8ubGl0ZXJhbChudWxsKSk7XG5cbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ21pblZlcnNpb24nLCBvLmxpdGVyYWwoTUlOSU1VTV9QQVJUSUFMX0xJTktFUl9ERUZFUl9TVVBQT1JUX1ZFUlNJT04pKTtcbiAgZGVmaW5pdGlvbk1hcC5zZXQoJ3ZlcnNpb24nLCBvLmxpdGVyYWwoJzAuMC4wLVBMQUNFSE9MREVSJykpO1xuICBkZWZpbml0aW9uTWFwLnNldCgnbmdJbXBvcnQnLCBvLmltcG9ydEV4cHIoUjMuY29yZSkpO1xuICBkZWZpbml0aW9uTWFwLnNldCgndHlwZScsIG1ldGFkYXRhLnR5cGUpO1xuICBkZWZpbml0aW9uTWFwLnNldCgncmVzb2x2ZURlZmVycmVkRGVwcycsIGNvbXBpbGVDb21wb25lbnRNZXRhZGF0YUFzeW5jUmVzb2x2ZXIoZGVwZW5kZW5jaWVzKSk7XG4gIGRlZmluaXRpb25NYXAuc2V0KFxuICAgICdyZXNvbHZlTWV0YWRhdGEnLFxuICAgIG8uYXJyb3dGbihcbiAgICAgIGRlcGVuZGVuY2llcy5tYXAoKGRlcCkgPT4gbmV3IG8uRm5QYXJhbShkZXAuc3ltYm9sTmFtZSwgby5EWU5BTUlDX1RZUEUpKSxcbiAgICAgIGNhbGxiYWNrUmV0dXJuRGVmaW5pdGlvbk1hcC50b0xpdGVyYWxNYXAoKSxcbiAgICApLFxuICApO1xuXG4gIHJldHVybiBvLmltcG9ydEV4cHIoUjMuZGVjbGFyZUNsYXNzTWV0YWRhdGFBc3luYykuY2FsbEZuKFtkZWZpbml0aW9uTWFwLnRvTGl0ZXJhbE1hcCgpXSk7XG59XG4iXX0=