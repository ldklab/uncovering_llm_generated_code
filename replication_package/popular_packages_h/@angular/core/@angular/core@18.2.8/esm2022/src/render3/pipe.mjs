/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { setInjectImplementation } from '../di/inject_switch';
import { formatRuntimeError, RuntimeError } from '../errors';
import { setInjectorProfilerContext } from './debug/injector_profiler';
import { getFactoryDef } from './definition_factory';
import { NodeInjector, setIncludeViewProviders } from './di';
import { store, ɵɵdirectiveInject } from './instructions/all';
import { isHostComponentStandalone } from './instructions/element_validation';
import { CONTEXT, DECLARATION_COMPONENT_VIEW, HEADER_OFFSET, TVIEW } from './interfaces/view';
import { pureFunction1Internal, pureFunction2Internal, pureFunction3Internal, pureFunction4Internal, pureFunctionVInternal, } from './pure_function';
import { getBindingRoot, getCurrentTNode, getLView, getTView } from './state';
import { load } from './util/view_utils';
/**
 * Create a pipe.
 *
 * @param index Pipe index where the pipe will be stored.
 * @param pipeName The name of the pipe
 * @returns T the instance of the pipe.
 *
 * @codeGenApi
 */
export function ɵɵpipe(index, pipeName) {
    const tView = getTView();
    let pipeDef;
    const adjustedIndex = index + HEADER_OFFSET;
    if (tView.firstCreatePass) {
        // The `getPipeDef` throws if a pipe with a given name is not found
        // (so we use non-null assertion below).
        pipeDef = getPipeDef(pipeName, tView.pipeRegistry);
        tView.data[adjustedIndex] = pipeDef;
        if (pipeDef.onDestroy) {
            (tView.destroyHooks ??= []).push(adjustedIndex, pipeDef.onDestroy);
        }
    }
    else {
        pipeDef = tView.data[adjustedIndex];
    }
    const pipeFactory = pipeDef.factory || (pipeDef.factory = getFactoryDef(pipeDef.type, true));
    let previousInjectorProfilerContext;
    if (ngDevMode) {
        previousInjectorProfilerContext = setInjectorProfilerContext({
            injector: new NodeInjector(getCurrentTNode(), getLView()),
            token: pipeDef.type,
        });
    }
    const previousInjectImplementation = setInjectImplementation(ɵɵdirectiveInject);
    try {
        // DI for pipes is supposed to behave like directives when placed on a component
        // host node, which means that we have to disable access to `viewProviders`.
        const previousIncludeViewProviders = setIncludeViewProviders(false);
        const pipeInstance = pipeFactory();
        setIncludeViewProviders(previousIncludeViewProviders);
        store(tView, getLView(), adjustedIndex, pipeInstance);
        return pipeInstance;
    }
    finally {
        // we have to restore the injector implementation in finally, just in case the creation of the
        // pipe throws an error.
        setInjectImplementation(previousInjectImplementation);
        ngDevMode && setInjectorProfilerContext(previousInjectorProfilerContext);
    }
}
/**
 * Searches the pipe registry for a pipe with the given name. If one is found,
 * returns the pipe. Otherwise, an error is thrown because the pipe cannot be resolved.
 *
 * @param name Name of pipe to resolve
 * @param registry Full list of available pipes
 * @returns Matching PipeDef
 */
function getPipeDef(name, registry) {
    if (registry) {
        if (ngDevMode) {
            const pipes = registry.filter((pipe) => pipe.name === name);
            // TODO: Throw an error in the next major
            if (pipes.length > 1) {
                console.warn(formatRuntimeError(313 /* RuntimeErrorCode.MULTIPLE_MATCHING_PIPES */, getMultipleMatchingPipesMessage(name)));
            }
        }
        for (let i = registry.length - 1; i >= 0; i--) {
            const pipeDef = registry[i];
            if (name === pipeDef.name) {
                return pipeDef;
            }
        }
    }
    if (ngDevMode) {
        throw new RuntimeError(-302 /* RuntimeErrorCode.PIPE_NOT_FOUND */, getPipeNotFoundErrorMessage(name));
    }
    return;
}
/**
 * Generates a helpful error message for the user when multiple pipes match the name.
 *
 * @param name Name of the pipe
 * @returns The error message
 */
function getMultipleMatchingPipesMessage(name) {
    const lView = getLView();
    const declarationLView = lView[DECLARATION_COMPONENT_VIEW];
    const context = declarationLView[CONTEXT];
    const hostIsStandalone = isHostComponentStandalone(lView);
    const componentInfoMessage = context ? ` in the '${context.constructor.name}' component` : '';
    const verifyMessage = `check ${hostIsStandalone ? "'@Component.imports' of this component" : 'the imports of this module'}`;
    const errorMessage = `Multiple pipes match the name \`${name}\`${componentInfoMessage}. ${verifyMessage}`;
    return errorMessage;
}
/**
 * Generates a helpful error message for the user when a pipe is not found.
 *
 * @param name Name of the missing pipe
 * @returns The error message
 */
function getPipeNotFoundErrorMessage(name) {
    const lView = getLView();
    const declarationLView = lView[DECLARATION_COMPONENT_VIEW];
    const context = declarationLView[CONTEXT];
    const hostIsStandalone = isHostComponentStandalone(lView);
    const componentInfoMessage = context ? ` in the '${context.constructor.name}' component` : '';
    const verifyMessage = `Verify that it is ${hostIsStandalone
        ? "included in the '@Component.imports' of this component"
        : 'declared or imported in this module'}`;
    const errorMessage = `The pipe '${name}' could not be found${componentInfoMessage}. ${verifyMessage}`;
    return errorMessage;
}
/**
 * Invokes a pipe with 1 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param offset the binding offset
 * @param v1 1st argument to {@link PipeTransform#transform}.
 *
 * @codeGenApi
 */
export function ɵɵpipeBind1(index, offset, v1) {
    const adjustedIndex = index + HEADER_OFFSET;
    const lView = getLView();
    const pipeInstance = load(lView, adjustedIndex);
    return isPure(lView, adjustedIndex)
        ? pureFunction1Internal(lView, getBindingRoot(), offset, pipeInstance.transform, v1, pipeInstance)
        : pipeInstance.transform(v1);
}
/**
 * Invokes a pipe with 2 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param v1 1st argument to {@link PipeTransform#transform}.
 * @param v2 2nd argument to {@link PipeTransform#transform}.
 *
 * @codeGenApi
 */
export function ɵɵpipeBind2(index, slotOffset, v1, v2) {
    const adjustedIndex = index + HEADER_OFFSET;
    const lView = getLView();
    const pipeInstance = load(lView, adjustedIndex);
    return isPure(lView, adjustedIndex)
        ? pureFunction2Internal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, v1, v2, pipeInstance)
        : pipeInstance.transform(v1, v2);
}
/**
 * Invokes a pipe with 3 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param v1 1st argument to {@link PipeTransform#transform}.
 * @param v2 2nd argument to {@link PipeTransform#transform}.
 * @param v3 4rd argument to {@link PipeTransform#transform}.
 *
 * @codeGenApi
 */
export function ɵɵpipeBind3(index, slotOffset, v1, v2, v3) {
    const adjustedIndex = index + HEADER_OFFSET;
    const lView = getLView();
    const pipeInstance = load(lView, adjustedIndex);
    return isPure(lView, adjustedIndex)
        ? pureFunction3Internal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, v1, v2, v3, pipeInstance)
        : pipeInstance.transform(v1, v2, v3);
}
/**
 * Invokes a pipe with 4 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param v1 1st argument to {@link PipeTransform#transform}.
 * @param v2 2nd argument to {@link PipeTransform#transform}.
 * @param v3 3rd argument to {@link PipeTransform#transform}.
 * @param v4 4th argument to {@link PipeTransform#transform}.
 *
 * @codeGenApi
 */
export function ɵɵpipeBind4(index, slotOffset, v1, v2, v3, v4) {
    const adjustedIndex = index + HEADER_OFFSET;
    const lView = getLView();
    const pipeInstance = load(lView, adjustedIndex);
    return isPure(lView, adjustedIndex)
        ? pureFunction4Internal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, v1, v2, v3, v4, pipeInstance)
        : pipeInstance.transform(v1, v2, v3, v4);
}
/**
 * Invokes a pipe with variable number of arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param values Array of arguments to pass to {@link PipeTransform#transform} method.
 *
 * @codeGenApi
 */
export function ɵɵpipeBindV(index, slotOffset, values) {
    const adjustedIndex = index + HEADER_OFFSET;
    const lView = getLView();
    const pipeInstance = load(lView, adjustedIndex);
    return isPure(lView, adjustedIndex)
        ? pureFunctionVInternal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, values, pipeInstance)
        : pipeInstance.transform.apply(pipeInstance, values);
}
function isPure(lView, index) {
    return lView[TVIEW].data[index].pure;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUUsWUFBWSxFQUFtQixNQUFNLFdBQVcsQ0FBQztBQUc3RSxPQUFPLEVBQTBCLDBCQUEwQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDOUYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxZQUFZLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDM0QsT0FBTyxFQUFDLEtBQUssRUFBRSxpQkFBaUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQzVELE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBRzVFLE9BQU8sRUFBQyxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsYUFBYSxFQUFTLEtBQUssRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ25HLE9BQU8sRUFDTCxxQkFBcUIsRUFDckIscUJBQXFCLEVBQ3JCLHFCQUFxQixFQUNyQixxQkFBcUIsRUFDckIscUJBQXFCLEdBQ3RCLE1BQU0saUJBQWlCLENBQUM7QUFDekIsT0FBTyxFQUFDLGNBQWMsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUM1RSxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFdkM7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLFVBQVUsTUFBTSxDQUFDLEtBQWEsRUFBRSxRQUFnQjtJQUNwRCxNQUFNLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQztJQUN6QixJQUFJLE9BQXFCLENBQUM7SUFD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QUM7SUFDL0QsT0FBTyxNQUFNLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQztRQUNqQyxDQUFDLENBQUMscUJBQXFCLENBQ25CLEtBQUssRUFDTCxjQUFjLEVBQUUsRUFDaEIsVUFBVSxFQUNWLFlBQVksQ0FBQyxTQUFTLEVBQ3RCLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixZQUFZLENBQ2I7UUFDSCxDQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxNQUFNLFVBQVUsV0FBVyxDQUFDLEtBQWEsRUFBRSxVQUFrQixFQUFFLE1BQXVCO0lBQ3BGLE1BQU0sYUFBYSxHQUFHLEtBQUssR0FBRyxhQUFhLENBQUM7SUFDNUMsTUFBTSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7SUFDekIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFnQixLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDL0QsT0FBTyxNQUFNLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQztRQUNqQyxDQUFDLENBQUMscUJBQXFCLENBQ25CLEtBQUssRUFDTCxjQUFjLEVBQUUsRUFDaEIsVUFBVSxFQUNWLFlBQVksQ0FBQyxTQUFTLEVBQ3RCLE1BQU0sRUFDTixZQUFZLENBQ2I7UUFDSCxDQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFFRCxTQUFTLE1BQU0sQ0FBQyxLQUFZLEVBQUUsS0FBYTtJQUN6QyxPQUFzQixLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBRSxDQUFDLElBQUksQ0FBQztBQUN2RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BpcGVUcmFuc2Zvcm19IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vcGlwZV90cmFuc2Zvcm0nO1xuaW1wb3J0IHtzZXRJbmplY3RJbXBsZW1lbnRhdGlvbn0gZnJvbSAnLi4vZGkvaW5qZWN0X3N3aXRjaCc7XG5pbXBvcnQge2Zvcm1hdFJ1bnRpbWVFcnJvciwgUnVudGltZUVycm9yLCBSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2UvdHlwZSc7XG5cbmltcG9ydCB7SW5qZWN0b3JQcm9maWxlckNvbnRleHQsIHNldEluamVjdG9yUHJvZmlsZXJDb250ZXh0fSBmcm9tICcuL2RlYnVnL2luamVjdG9yX3Byb2ZpbGVyJztcbmltcG9ydCB7Z2V0RmFjdG9yeURlZn0gZnJvbSAnLi9kZWZpbml0aW9uX2ZhY3RvcnknO1xuaW1wb3J0IHtOb2RlSW5qZWN0b3IsIHNldEluY2x1ZGVWaWV3UHJvdmlkZXJzfSBmcm9tICcuL2RpJztcbmltcG9ydCB7c3RvcmUsIMm1ybVkaXJlY3RpdmVJbmplY3R9IGZyb20gJy4vaW5zdHJ1Y3Rpb25zL2FsbCc7XG5pbXBvcnQge2lzSG9zdENvbXBvbmVudFN0YW5kYWxvbmV9IGZyb20gJy4vaW5zdHJ1Y3Rpb25zL2VsZW1lbnRfdmFsaWRhdGlvbic7XG5pbXBvcnQge1BpcGVEZWYsIFBpcGVEZWZMaXN0fSBmcm9tICcuL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge1RUZXh0Tm9kZX0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtDT05URVhULCBERUNMQVJBVElPTl9DT01QT05FTlRfVklFVywgSEVBREVSX09GRlNFVCwgTFZpZXcsIFRWSUVXfSBmcm9tICcuL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge1xuICBwdXJlRnVuY3Rpb24xSW50ZXJuYWwsXG4gIHB1cmVGdW5jdGlvbjJJbnRlcm5hbCxcbiAgcHVyZUZ1bmN0aW9uM0ludGVybmFsLFxuICBwdXJlRnVuY3Rpb240SW50ZXJuYWwsXG4gIHB1cmVGdW5jdGlvblZJbnRlcm5hbCxcbn0gZnJvbSAnLi9wdXJlX2Z1bmN0aW9uJztcbmltcG9ydCB7Z2V0QmluZGluZ1Jvb3QsIGdldEN1cnJlbnRUTm9kZSwgZ2V0TFZpZXcsIGdldFRWaWV3fSBmcm9tICcuL3N0YXRlJztcbmltcG9ydCB7bG9hZH0gZnJvbSAnLi91dGlsL3ZpZXdfdXRpbHMnO1xuXG4vKipcbiAqIENyZWF0ZSBhIHBpcGUuXG4gKlxuICogQHBhcmFtIGluZGV4IFBpcGUgaW5kZXggd2hlcmUgdGhlIHBpcGUgd2lsbCBiZSBzdG9yZWQuXG4gKiBAcGFyYW0gcGlwZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHBpcGVcbiAqIEByZXR1cm5zIFQgdGhlIGluc3RhbmNlIG9mIHRoZSBwaXBlLlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1cGlwZShpbmRleDogbnVtYmVyLCBwaXBlTmFtZTogc3RyaW5nKTogYW55IHtcbiAgY29uc3QgdFZpZXcgPSBnZXRUVmlldygpO1xuICBsZXQgcGlwZURlZjogUGlwZURlZjxhbnk+O1xuICBjb25zdCBhZGp1c3RlZEluZGV4ID0gaW5kZXggKyBIRUFERVJfT0ZGU0VUO1xuXG4gIGlmICh0Vmlldy5maXJzdENyZWF0ZVBhc3MpIHtcbiAgICAvLyBUaGUgYGdldFBpcGVEZWZgIHRocm93cyBpZiBhIHBpcGUgd2l0aCBhIGdpdmVuIG5hbWUgaXMgbm90IGZvdW5kXG4gICAgLy8gKHNvIHdlIHVzZSBub24tbnVsbCBhc3NlcnRpb24gYmVsb3cpLlxuICAgIHBpcGVEZWYgPSBnZXRQaXBlRGVmKHBpcGVOYW1lLCB0Vmlldy5waXBlUmVnaXN0cnkpITtcbiAgICB0Vmlldy5kYXRhW2FkanVzdGVkSW5kZXhdID0gcGlwZURlZjtcbiAgICBpZiAocGlwZURlZi5vbkRlc3Ryb3kpIHtcbiAgICAgICh0Vmlldy5kZXN0cm95SG9va3MgPz89IFtdKS5wdXNoKGFkanVzdGVkSW5kZXgsIHBpcGVEZWYub25EZXN0cm95KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcGlwZURlZiA9IHRWaWV3LmRhdGFbYWRqdXN0ZWRJbmRleF0gYXMgUGlwZURlZjxhbnk+O1xuICB9XG5cbiAgY29uc3QgcGlwZUZhY3RvcnkgPSBwaXBlRGVmLmZhY3RvcnkgfHwgKHBpcGVEZWYuZmFjdG9yeSA9IGdldEZhY3RvcnlEZWYocGlwZURlZi50eXBlLCB0cnVlKSk7XG5cbiAgbGV0IHByZXZpb3VzSW5qZWN0b3JQcm9maWxlckNvbnRleHQ6IEluamVjdG9yUHJvZmlsZXJDb250ZXh0O1xuICBpZiAobmdEZXZNb2RlKSB7XG4gICAgcHJldmlvdXNJbmplY3RvclByb2ZpbGVyQ29udGV4dCA9IHNldEluamVjdG9yUHJvZmlsZXJDb250ZXh0KHtcbiAgICAgIGluamVjdG9yOiBuZXcgTm9kZUluamVjdG9yKGdldEN1cnJlbnRUTm9kZSgpIGFzIFRUZXh0Tm9kZSwgZ2V0TFZpZXcoKSksXG4gICAgICB0b2tlbjogcGlwZURlZi50eXBlLFxuICAgIH0pO1xuICB9XG4gIGNvbnN0IHByZXZpb3VzSW5qZWN0SW1wbGVtZW50YXRpb24gPSBzZXRJbmplY3RJbXBsZW1lbnRhdGlvbijJtcm1ZGlyZWN0aXZlSW5qZWN0KTtcbiAgdHJ5IHtcbiAgICAvLyBESSBmb3IgcGlwZXMgaXMgc3VwcG9zZWQgdG8gYmVoYXZlIGxpa2UgZGlyZWN0aXZlcyB3aGVuIHBsYWNlZCBvbiBhIGNvbXBvbmVudFxuICAgIC8vIGhvc3Qgbm9kZSwgd2hpY2ggbWVhbnMgdGhhdCB3ZSBoYXZlIHRvIGRpc2FibGUgYWNjZXNzIHRvIGB2aWV3UHJvdmlkZXJzYC5cbiAgICBjb25zdCBwcmV2aW91c0luY2x1ZGVWaWV3UHJvdmlkZXJzID0gc2V0SW5jbHVkZVZpZXdQcm92aWRlcnMoZmFsc2UpO1xuICAgIGNvbnN0IHBpcGVJbnN0YW5jZSA9IHBpcGVGYWN0b3J5KCk7XG4gICAgc2V0SW5jbHVkZVZpZXdQcm92aWRlcnMocHJldmlvdXNJbmNsdWRlVmlld1Byb3ZpZGVycyk7XG4gICAgc3RvcmUodFZpZXcsIGdldExWaWV3KCksIGFkanVzdGVkSW5kZXgsIHBpcGVJbnN0YW5jZSk7XG4gICAgcmV0dXJuIHBpcGVJbnN0YW5jZTtcbiAgfSBmaW5hbGx5IHtcbiAgICAvLyB3ZSBoYXZlIHRvIHJlc3RvcmUgdGhlIGluamVjdG9yIGltcGxlbWVudGF0aW9uIGluIGZpbmFsbHksIGp1c3QgaW4gY2FzZSB0aGUgY3JlYXRpb24gb2YgdGhlXG4gICAgLy8gcGlwZSB0aHJvd3MgYW4gZXJyb3IuXG4gICAgc2V0SW5qZWN0SW1wbGVtZW50YXRpb24ocHJldmlvdXNJbmplY3RJbXBsZW1lbnRhdGlvbik7XG4gICAgbmdEZXZNb2RlICYmIHNldEluamVjdG9yUHJvZmlsZXJDb250ZXh0KHByZXZpb3VzSW5qZWN0b3JQcm9maWxlckNvbnRleHQhKTtcbiAgfVxufVxuXG4vKipcbiAqIFNlYXJjaGVzIHRoZSBwaXBlIHJlZ2lzdHJ5IGZvciBhIHBpcGUgd2l0aCB0aGUgZ2l2ZW4gbmFtZS4gSWYgb25lIGlzIGZvdW5kLFxuICogcmV0dXJucyB0aGUgcGlwZS4gT3RoZXJ3aXNlLCBhbiBlcnJvciBpcyB0aHJvd24gYmVjYXVzZSB0aGUgcGlwZSBjYW5ub3QgYmUgcmVzb2x2ZWQuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiBwaXBlIHRvIHJlc29sdmVcbiAqIEBwYXJhbSByZWdpc3RyeSBGdWxsIGxpc3Qgb2YgYXZhaWxhYmxlIHBpcGVzXG4gKiBAcmV0dXJucyBNYXRjaGluZyBQaXBlRGVmXG4gKi9cbmZ1bmN0aW9uIGdldFBpcGVEZWYobmFtZTogc3RyaW5nLCByZWdpc3RyeTogUGlwZURlZkxpc3QgfCBudWxsKTogUGlwZURlZjxhbnk+IHwgdW5kZWZpbmVkIHtcbiAgaWYgKHJlZ2lzdHJ5KSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgY29uc3QgcGlwZXMgPSByZWdpc3RyeS5maWx0ZXIoKHBpcGUpID0+IHBpcGUubmFtZSA9PT0gbmFtZSk7XG4gICAgICAvLyBUT0RPOiBUaHJvdyBhbiBlcnJvciBpbiB0aGUgbmV4dCBtYWpvclxuICAgICAgaWYgKHBpcGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTVVMVElQTEVfTUFUQ0hJTkdfUElQRVMsXG4gICAgICAgICAgICBnZXRNdWx0aXBsZU1hdGNoaW5nUGlwZXNNZXNzYWdlKG5hbWUpLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSByZWdpc3RyeS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3QgcGlwZURlZiA9IHJlZ2lzdHJ5W2ldO1xuICAgICAgaWYgKG5hbWUgPT09IHBpcGVEZWYubmFtZSkge1xuICAgICAgICByZXR1cm4gcGlwZURlZjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKG5nRGV2TW9kZSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5QSVBFX05PVF9GT1VORCwgZ2V0UGlwZU5vdEZvdW5kRXJyb3JNZXNzYWdlKG5hbWUpKTtcbiAgfVxuICByZXR1cm47XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgaGVscGZ1bCBlcnJvciBtZXNzYWdlIGZvciB0aGUgdXNlciB3aGVuIG11bHRpcGxlIHBpcGVzIG1hdGNoIHRoZSBuYW1lLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIHBpcGVcbiAqIEByZXR1cm5zIFRoZSBlcnJvciBtZXNzYWdlXG4gKi9cbmZ1bmN0aW9uIGdldE11bHRpcGxlTWF0Y2hpbmdQaXBlc01lc3NhZ2UobmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgZGVjbGFyYXRpb25MVmlldyA9IGxWaWV3W0RFQ0xBUkFUSU9OX0NPTVBPTkVOVF9WSUVXXSBhcyBMVmlldzxUeXBlPHVua25vd24+PjtcbiAgY29uc3QgY29udGV4dCA9IGRlY2xhcmF0aW9uTFZpZXdbQ09OVEVYVF07XG4gIGNvbnN0IGhvc3RJc1N0YW5kYWxvbmUgPSBpc0hvc3RDb21wb25lbnRTdGFuZGFsb25lKGxWaWV3KTtcbiAgY29uc3QgY29tcG9uZW50SW5mb01lc3NhZ2UgPSBjb250ZXh0ID8gYCBpbiB0aGUgJyR7Y29udGV4dC5jb25zdHJ1Y3Rvci5uYW1lfScgY29tcG9uZW50YCA6ICcnO1xuICBjb25zdCB2ZXJpZnlNZXNzYWdlID0gYGNoZWNrICR7XG4gICAgaG9zdElzU3RhbmRhbG9uZSA/IFwiJ0BDb21wb25lbnQuaW1wb3J0cycgb2YgdGhpcyBjb21wb25lbnRcIiA6ICd0aGUgaW1wb3J0cyBvZiB0aGlzIG1vZHVsZSdcbiAgfWA7XG4gIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBNdWx0aXBsZSBwaXBlcyBtYXRjaCB0aGUgbmFtZSBcXGAke25hbWV9XFxgJHtjb21wb25lbnRJbmZvTWVzc2FnZX0uICR7dmVyaWZ5TWVzc2FnZX1gO1xuICByZXR1cm4gZXJyb3JNZXNzYWdlO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGhlbHBmdWwgZXJyb3IgbWVzc2FnZSBmb3IgdGhlIHVzZXIgd2hlbiBhIHBpcGUgaXMgbm90IGZvdW5kLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIG1pc3NpbmcgcGlwZVxuICogQHJldHVybnMgVGhlIGVycm9yIG1lc3NhZ2VcbiAqL1xuZnVuY3Rpb24gZ2V0UGlwZU5vdEZvdW5kRXJyb3JNZXNzYWdlKG5hbWU6IHN0cmluZykge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IGRlY2xhcmF0aW9uTFZpZXcgPSBsVmlld1tERUNMQVJBVElPTl9DT01QT05FTlRfVklFV10gYXMgTFZpZXc8VHlwZTx1bmtub3duPj47XG4gIGNvbnN0IGNvbnRleHQgPSBkZWNsYXJhdGlvbkxWaWV3W0NPTlRFWFRdO1xuICBjb25zdCBob3N0SXNTdGFuZGFsb25lID0gaXNIb3N0Q29tcG9uZW50U3RhbmRhbG9uZShsVmlldyk7XG4gIGNvbnN0IGNvbXBvbmVudEluZm9NZXNzYWdlID0gY29udGV4dCA/IGAgaW4gdGhlICcke2NvbnRleHQuY29uc3RydWN0b3IubmFtZX0nIGNvbXBvbmVudGAgOiAnJztcbiAgY29uc3QgdmVyaWZ5TWVzc2FnZSA9IGBWZXJpZnkgdGhhdCBpdCBpcyAke1xuICAgIGhvc3RJc1N0YW5kYWxvbmVcbiAgICAgID8gXCJpbmNsdWRlZCBpbiB0aGUgJ0BDb21wb25lbnQuaW1wb3J0cycgb2YgdGhpcyBjb21wb25lbnRcIlxuICAgICAgOiAnZGVjbGFyZWQgb3IgaW1wb3J0ZWQgaW4gdGhpcyBtb2R1bGUnXG4gIH1gO1xuICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVGhlIHBpcGUgJyR7bmFtZX0nIGNvdWxkIG5vdCBiZSBmb3VuZCR7Y29tcG9uZW50SW5mb01lc3NhZ2V9LiAke3ZlcmlmeU1lc3NhZ2V9YDtcbiAgcmV0dXJuIGVycm9yTWVzc2FnZTtcbn1cblxuLyoqXG4gKiBJbnZva2VzIGEgcGlwZSB3aXRoIDEgYXJndW1lbnRzLlxuICpcbiAqIFRoaXMgaW5zdHJ1Y3Rpb24gYWN0cyBhcyBhIGd1YXJkIHRvIHtAbGluayBQaXBlVHJhbnNmb3JtI3RyYW5zZm9ybX0gaW52b2tpbmdcbiAqIHRoZSBwaXBlIG9ubHkgd2hlbiBhbiBpbnB1dCB0byB0aGUgcGlwZSBjaGFuZ2VzLlxuICpcbiAqIEBwYXJhbSBpbmRleCBQaXBlIGluZGV4IHdoZXJlIHRoZSBwaXBlIHdhcyBzdG9yZWQgb24gY3JlYXRpb24uXG4gKiBAcGFyYW0gb2Zmc2V0IHRoZSBiaW5kaW5nIG9mZnNldFxuICogQHBhcmFtIHYxIDFzdCBhcmd1bWVudCB0byB7QGxpbmsgUGlwZVRyYW5zZm9ybSN0cmFuc2Zvcm19LlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1cGlwZUJpbmQxKGluZGV4OiBudW1iZXIsIG9mZnNldDogbnVtYmVyLCB2MTogYW55KTogYW55IHtcbiAgY29uc3QgYWRqdXN0ZWRJbmRleCA9IGluZGV4ICsgSEVBREVSX09GRlNFVDtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCBwaXBlSW5zdGFuY2UgPSBsb2FkPFBpcGVUcmFuc2Zvcm0+KGxWaWV3LCBhZGp1c3RlZEluZGV4KTtcbiAgcmV0dXJuIGlzUHVyZShsVmlldywgYWRqdXN0ZWRJbmRleClcbiAgICA/IHB1cmVGdW5jdGlvbjFJbnRlcm5hbChcbiAgICAgICAgbFZpZXcsXG4gICAgICAgIGdldEJpbmRpbmdSb290KCksXG4gICAgICAgIG9mZnNldCxcbiAgICAgICAgcGlwZUluc3RhbmNlLnRyYW5zZm9ybSxcbiAgICAgICAgdjEsXG4gICAgICAgIHBpcGVJbnN0YW5jZSxcbiAgICAgIClcbiAgICA6IHBpcGVJbnN0YW5jZS50cmFuc2Zvcm0odjEpO1xufVxuXG4vKipcbiAqIEludm9rZXMgYSBwaXBlIHdpdGggMiBhcmd1bWVudHMuXG4gKlxuICogVGhpcyBpbnN0cnVjdGlvbiBhY3RzIGFzIGEgZ3VhcmQgdG8ge0BsaW5rIFBpcGVUcmFuc2Zvcm0jdHJhbnNmb3JtfSBpbnZva2luZ1xuICogdGhlIHBpcGUgb25seSB3aGVuIGFuIGlucHV0IHRvIHRoZSBwaXBlIGNoYW5nZXMuXG4gKlxuICogQHBhcmFtIGluZGV4IFBpcGUgaW5kZXggd2hlcmUgdGhlIHBpcGUgd2FzIHN0b3JlZCBvbiBjcmVhdGlvbi5cbiAqIEBwYXJhbSBzbG90T2Zmc2V0IHRoZSBvZmZzZXQgaW4gdGhlIHJlc2VydmVkIHNsb3Qgc3BhY2VcbiAqIEBwYXJhbSB2MSAxc3QgYXJndW1lbnQgdG8ge0BsaW5rIFBpcGVUcmFuc2Zvcm0jdHJhbnNmb3JtfS5cbiAqIEBwYXJhbSB2MiAybmQgYXJndW1lbnQgdG8ge0BsaW5rIFBpcGVUcmFuc2Zvcm0jdHJhbnNmb3JtfS5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtXBpcGVCaW5kMihpbmRleDogbnVtYmVyLCBzbG90T2Zmc2V0OiBudW1iZXIsIHYxOiBhbnksIHYyOiBhbnkpOiBhbnkge1xuICBjb25zdCBhZGp1c3RlZEluZGV4ID0gaW5kZXggKyBIRUFERVJfT0ZGU0VUO1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IHBpcGVJbnN0YW5jZSA9IGxvYWQ8UGlwZVRyYW5zZm9ybT4obFZpZXcsIGFkanVzdGVkSW5kZXgpO1xuICByZXR1cm4gaXNQdXJlKGxWaWV3LCBhZGp1c3RlZEluZGV4KVxuICAgID8gcHVyZUZ1bmN0aW9uMkludGVybmFsKFxuICAgICAgICBsVmlldyxcbiAgICAgICAgZ2V0QmluZGluZ1Jvb3QoKSxcbiAgICAgICAgc2xvdE9mZnNldCxcbiAgICAgICAgcGlwZUluc3RhbmNlLnRyYW5zZm9ybSxcbiAgICAgICAgdjEsXG4gICAgICAgIHYyLFxuICAgICAgICBwaXBlSW5zdGFuY2UsXG4gICAgICApXG4gICAgOiBwaXBlSW5zdGFuY2UudHJhbnNmb3JtKHYxLCB2Mik7XG59XG5cbi8qKlxuICogSW52b2tlcyBhIHBpcGUgd2l0aCAzIGFyZ3VtZW50cy5cbiAqXG4gKiBUaGlzIGluc3RydWN0aW9uIGFjdHMgYXMgYSBndWFyZCB0byB7QGxpbmsgUGlwZVRyYW5zZm9ybSN0cmFuc2Zvcm19IGludm9raW5nXG4gKiB0aGUgcGlwZSBvbmx5IHdoZW4gYW4gaW5wdXQgdG8gdGhlIHBpcGUgY2hhbmdlcy5cbiAqXG4gKiBAcGFyYW0gaW5kZXggUGlwZSBpbmRleCB3aGVyZSB0aGUgcGlwZSB3YXMgc3RvcmVkIG9uIGNyZWF0aW9uLlxuICogQHBhcmFtIHNsb3RPZmZzZXQgdGhlIG9mZnNldCBpbiB0aGUgcmVzZXJ2ZWQgc2xvdCBzcGFjZVxuICogQHBhcmFtIHYxIDFzdCBhcmd1bWVudCB0byB7QGxpbmsgUGlwZVRyYW5zZm9ybSN0cmFuc2Zvcm19LlxuICogQHBhcmFtIHYyIDJuZCBhcmd1bWVudCB0byB7QGxpbmsgUGlwZVRyYW5zZm9ybSN0cmFuc2Zvcm19LlxuICogQHBhcmFtIHYzIDRyZCBhcmd1bWVudCB0byB7QGxpbmsgUGlwZVRyYW5zZm9ybSN0cmFuc2Zvcm19LlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1cGlwZUJpbmQzKGluZGV4OiBudW1iZXIsIHNsb3RPZmZzZXQ6IG51bWJlciwgdjE6IGFueSwgdjI6IGFueSwgdjM6IGFueSk6IGFueSB7XG4gIGNvbnN0IGFkanVzdGVkSW5kZXggPSBpbmRleCArIEhFQURFUl9PRkZTRVQ7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgcGlwZUluc3RhbmNlID0gbG9hZDxQaXBlVHJhbnNmb3JtPihsVmlldywgYWRqdXN0ZWRJbmRleCk7XG4gIHJldHVybiBpc1B1cmUobFZpZXcsIGFkanVzdGVkSW5kZXgpXG4gICAgPyBwdXJlRnVuY3Rpb24zSW50ZXJuYWwoXG4gICAgICAgIGxWaWV3LFxuICAgICAgICBnZXRCaW5kaW5nUm9vdCgpLFxuICAgICAgICBzbG90T2Zmc2V0LFxuICAgICAgICBwaXBlSW5zdGFuY2UudHJhbnNmb3JtLFxuICAgICAgICB2MSxcbiAgICAgICAgdjIsXG4gICAgICAgIHYzLFxuICAgICAgICBwaXBlSW5zdGFuY2UsXG4gICAgICApXG4gICAgOiBwaXBlSW5zdGFuY2UudHJhbnNmb3JtKHYxLCB2MiwgdjMpO1xufVxuXG4vKipcbiAqIEludm9rZXMgYSBwaXBlIHdpdGggNCBhcmd1bWVudHMuXG4gKlxuICogVGhpcyBpbnN0cnVjdGlvbiBhY3RzIGFzIGEgZ3VhcmQgdG8ge0BsaW5rIFBpcGVUcmFuc2Zvcm0jdHJhbnNmb3JtfSBpbnZva2luZ1xuICogdGhlIHBpcGUgb25seSB3aGVuIGFuIGlucHV0IHRvIHRoZSBwaXBlIGNoYW5nZXMuXG4gKlxuICogQHBhcmFtIGluZGV4IFBpcGUgaW5kZXggd2hlcmUgdGhlIHBpcGUgd2FzIHN0b3JlZCBvbiBjcmVhdGlvbi5cbiAqIEBwYXJhbSBzbG90T2Zmc2V0IHRoZSBvZmZzZXQgaW4gdGhlIHJlc2VydmVkIHNsb3Qgc3BhY2VcbiAqIEBwYXJhbSB2MSAxc3QgYXJndW1lbnQgdG8ge0BsaW5rIFBpcGVUcmFuc2Zvcm0jdHJhbnNmb3JtfS5cbiAqIEBwYXJhbSB2MiAybmQgYXJndW1lbnQgdG8ge0BsaW5rIFBpcGVUcmFuc2Zvcm0jdHJhbnNmb3JtfS5cbiAqIEBwYXJhbSB2MyAzcmQgYXJndW1lbnQgdG8ge0BsaW5rIFBpcGVUcmFuc2Zvcm0jdHJhbnNmb3JtfS5cbiAqIEBwYXJhbSB2NCA0dGggYXJndW1lbnQgdG8ge0BsaW5rIFBpcGVUcmFuc2Zvcm0jdHJhbnNmb3JtfS5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtXBpcGVCaW5kNChcbiAgaW5kZXg6IG51bWJlcixcbiAgc2xvdE9mZnNldDogbnVtYmVyLFxuICB2MTogYW55LFxuICB2MjogYW55LFxuICB2MzogYW55LFxuICB2NDogYW55LFxuKTogYW55IHtcbiAgY29uc3QgYWRqdXN0ZWRJbmRleCA9IGluZGV4ICsgSEVBREVSX09GRlNFVDtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCBwaXBlSW5zdGFuY2UgPSBsb2FkPFBpcGVUcmFuc2Zvcm0+KGxWaWV3LCBhZGp1c3RlZEluZGV4KTtcbiAgcmV0dXJuIGlzUHVyZShsVmlldywgYWRqdXN0ZWRJbmRleClcbiAgICA/IHB1cmVGdW5jdGlvbjRJbnRlcm5hbChcbiAgICAgICAgbFZpZXcsXG4gICAgICAgIGdldEJpbmRpbmdSb290KCksXG4gICAgICAgIHNsb3RPZmZzZXQsXG4gICAgICAgIHBpcGVJbnN0YW5jZS50cmFuc2Zvcm0sXG4gICAgICAgIHYxLFxuICAgICAgICB2MixcbiAgICAgICAgdjMsXG4gICAgICAgIHY0LFxuICAgICAgICBwaXBlSW5zdGFuY2UsXG4gICAgICApXG4gICAgOiBwaXBlSW5zdGFuY2UudHJhbnNmb3JtKHYxLCB2MiwgdjMsIHY0KTtcbn1cblxuLyoqXG4gKiBJbnZva2VzIGEgcGlwZSB3aXRoIHZhcmlhYmxlIG51bWJlciBvZiBhcmd1bWVudHMuXG4gKlxuICogVGhpcyBpbnN0cnVjdGlvbiBhY3RzIGFzIGEgZ3VhcmQgdG8ge0BsaW5rIFBpcGVUcmFuc2Zvcm0jdHJhbnNmb3JtfSBpbnZva2luZ1xuICogdGhlIHBpcGUgb25seSB3aGVuIGFuIGlucHV0IHRvIHRoZSBwaXBlIGNoYW5nZXMuXG4gKlxuICogQHBhcmFtIGluZGV4IFBpcGUgaW5kZXggd2hlcmUgdGhlIHBpcGUgd2FzIHN0b3JlZCBvbiBjcmVhdGlvbi5cbiAqIEBwYXJhbSBzbG90T2Zmc2V0IHRoZSBvZmZzZXQgaW4gdGhlIHJlc2VydmVkIHNsb3Qgc3BhY2VcbiAqIEBwYXJhbSB2YWx1ZXMgQXJyYXkgb2YgYXJndW1lbnRzIHRvIHBhc3MgdG8ge0BsaW5rIFBpcGVUcmFuc2Zvcm0jdHJhbnNmb3JtfSBtZXRob2QuXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVwaXBlQmluZFYoaW5kZXg6IG51bWJlciwgc2xvdE9mZnNldDogbnVtYmVyLCB2YWx1ZXM6IFthbnksIC4uLmFueVtdXSk6IGFueSB7XG4gIGNvbnN0IGFkanVzdGVkSW5kZXggPSBpbmRleCArIEhFQURFUl9PRkZTRVQ7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgcGlwZUluc3RhbmNlID0gbG9hZDxQaXBlVHJhbnNmb3JtPihsVmlldywgYWRqdXN0ZWRJbmRleCk7XG4gIHJldHVybiBpc1B1cmUobFZpZXcsIGFkanVzdGVkSW5kZXgpXG4gICAgPyBwdXJlRnVuY3Rpb25WSW50ZXJuYWwoXG4gICAgICAgIGxWaWV3LFxuICAgICAgICBnZXRCaW5kaW5nUm9vdCgpLFxuICAgICAgICBzbG90T2Zmc2V0LFxuICAgICAgICBwaXBlSW5zdGFuY2UudHJhbnNmb3JtLFxuICAgICAgICB2YWx1ZXMsXG4gICAgICAgIHBpcGVJbnN0YW5jZSxcbiAgICAgIClcbiAgICA6IHBpcGVJbnN0YW5jZS50cmFuc2Zvcm0uYXBwbHkocGlwZUluc3RhbmNlLCB2YWx1ZXMpO1xufVxuXG5mdW5jdGlvbiBpc1B1cmUobFZpZXc6IExWaWV3LCBpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoPFBpcGVEZWY8YW55Pj5sVmlld1tUVklFV10uZGF0YVtpbmRleF0pLnB1cmU7XG59XG4iXX0=