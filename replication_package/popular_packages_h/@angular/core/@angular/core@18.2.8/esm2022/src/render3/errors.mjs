/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { RuntimeError } from '../errors';
import { getComponentDef } from './definition';
import { getDeclarationComponentDef } from './instructions/element_validation';
import { TVIEW } from './interfaces/view';
import { INTERPOLATION_DELIMITER } from './util/misc_utils';
import { stringifyForError } from './util/stringify_utils';
/**
 * The max length of the string representation of a value in an error message
 */
const VALUE_STRING_LENGTH_LIMIT = 200;
/** Verifies that a given type is a Standalone Component. */
export function assertStandaloneComponentType(type) {
    assertComponentDef(type);
    const componentDef = getComponentDef(type);
    if (!componentDef.standalone) {
        throw new RuntimeError(907 /* RuntimeErrorCode.TYPE_IS_NOT_STANDALONE */, `The ${stringifyForError(type)} component is not marked as standalone, ` +
            `but Angular expects to have a standalone component here. ` +
            `Please make sure the ${stringifyForError(type)} component has ` +
            `the \`standalone: true\` flag in the decorator.`);
    }
}
/** Verifies whether a given type is a component */
export function assertComponentDef(type) {
    if (!getComponentDef(type)) {
        throw new RuntimeError(906 /* RuntimeErrorCode.MISSING_GENERATED_DEF */, `The ${stringifyForError(type)} is not an Angular component, ` +
            `make sure it has the \`@Component\` decorator.`);
    }
}
/** Called when there are multiple component selectors that match a given node */
export function throwMultipleComponentError(tNode, first, second) {
    throw new RuntimeError(-300 /* RuntimeErrorCode.MULTIPLE_COMPONENTS_MATCH */, `Multiple components match node with tagname ${tNode.value}: ` +
        `${stringifyForError(first)} and ` +
        `${stringifyForError(second)}`);
}
/** Throws an ExpressionChangedAfterChecked error if checkNoChanges mode is on. */
export function throwErrorIfNoChangesMode(creationMode, oldValue, currValue, propName, lView) {
    const hostComponentDef = getDeclarationComponentDef(lView);
    const componentClassName = hostComponentDef?.type?.name;
    const field = propName ? ` for '${propName}'` : '';
    let msg = `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value${field}: '${formatValue(oldValue)}'. Current value: '${formatValue(currValue)}'.${componentClassName ? ` Expression location: ${componentClassName} component` : ''}`;
    if (creationMode) {
        msg +=
            ` It seems like the view has been created after its parent and its children have been dirty checked.` +
                ` Has it been created in a change detection hook?`;
    }
    throw new RuntimeError(-100 /* RuntimeErrorCode.EXPRESSION_CHANGED_AFTER_CHECKED */, msg);
}
function formatValue(value) {
    let strValue = String(value);
    // JSON.stringify will throw on circular references
    try {
        if (Array.isArray(value) || strValue === '[object Object]') {
            strValue = JSON.stringify(value);
        }
    }
    catch (error) { }
    return strValue.length > VALUE_STRING_LENGTH_LIMIT
        ? strValue.substring(0, VALUE_STRING_LENGTH_LIMIT) + '…'
        : strValue;
}
function constructDetailsForInterpolation(lView, rootIndex, expressionIndex, meta, changedValue) {
    const [propName, prefix, ...chunks] = meta.split(INTERPOLATION_DELIMITER);
    let oldValue = prefix, newValue = prefix;
    for (let i = 0; i < chunks.length; i++) {
        const slotIdx = rootIndex + i;
        oldValue += `${lView[slotIdx]}${chunks[i]}`;
        newValue += `${slotIdx === expressionIndex ? changedValue : lView[slotIdx]}${chunks[i]}`;
    }
    return { propName, oldValue, newValue };
}
/**
 * Constructs an object that contains details for the ExpressionChangedAfterItHasBeenCheckedError:
 * - property name (for property bindings or interpolations)
 * - old and new values, enriched using information from metadata
 *
 * More information on the metadata storage format can be found in `storePropertyBindingMetadata`
 * function description.
 */
export function getExpressionChangedErrorDetails(lView, bindingIndex, oldValue, newValue) {
    const tData = lView[TVIEW].data;
    const metadata = tData[bindingIndex];
    if (typeof metadata === 'string') {
        // metadata for property interpolation
        if (metadata.indexOf(INTERPOLATION_DELIMITER) > -1) {
            return constructDetailsForInterpolation(lView, bindingIndex, bindingIndex, metadata, newValue);
        }
        // metadata for property binding
        return { propName: metadata, oldValue, newValue };
    }
    // metadata is not available for this expression, check if this expression is a part of the
    // property interpolation by going from the current binding index left and look for a string that
    // contains INTERPOLATION_DELIMITER, the layout in tView.data for this case will look like this:
    // [..., 'id�Prefix � and � suffix', null, null, null, ...]
    if (metadata === null) {
        let idx = bindingIndex - 1;
        while (typeof tData[idx] !== 'string' && tData[idx + 1] === null) {
            idx--;
        }
        const meta = tData[idx];
        if (typeof meta === 'string') {
            const matches = meta.match(new RegExp(INTERPOLATION_DELIMITER, 'g'));
            // first interpolation delimiter separates property name from interpolation parts (in case of
            // property interpolations), so we subtract one from total number of found delimiters
            if (matches && matches.length - 1 > bindingIndex - idx) {
                return constructDetailsForInterpolation(lView, idx, bindingIndex, meta, newValue);
            }
        }
    }
    return { propName: undefined, oldValue, newValue };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9lcnJvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBbUIsTUFBTSxXQUFXLENBQUM7QUFHekQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUU3RSxPQUFPLEVBQVEsS0FBSyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDL0MsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDMUQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFFekQ7O0dBRUc7QUFDSCxNQUFNLHlCQUF5QixHQUFHLEdBQUcsQ0FBQztBQUV0Qyw0REFBNEQ7QUFDNUQsTUFBTSxVQUFVLDZCQUE2QixDQUFDLElBQW1CO0lBQy9ELGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUUsQ0FBQztJQUM1QyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzdCLE1BQU0sSUFBSSxZQUFZLG9EQUVwQixPQUFPLGlCQUFpQixDQUFDLElBQUksQ0FBQywwQ0FBMEM7WUFDdEUsMkRBQTJEO1lBQzNELHdCQUF3QixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsaUJBQWlCO1lBQ2hFLGlEQUFpRCxDQUNwRCxDQUFDO0lBQ0osQ0FBQztBQUNILENBQUM7QUFFRCxtREFBbUQ7QUFDbkQsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBQW1CO0lBQ3BELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUMzQixNQUFNLElBQUksWUFBWSxtREFFcEIsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDO1lBQzVELGdEQUFnRCxDQUNuRCxDQUFDO0lBQ0osQ0FBQztBQUNILENBQUM7QUFFRCxpRkFBaUY7QUFDakYsTUFBTSxVQUFVLDJCQUEyQixDQUN6QyxLQUFZLEVBQ1osS0FBb0IsRUFDcEIsTUFBcUI7SUFFckIsTUFBTSxJQUFJLFlBQVksd0RBRXBCLCtDQUErQyxLQUFLLENBQUMsS0FBSyxJQUFJO1FBQzVELEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLE9BQU87UUFDbEMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUNqQyxDQUFDO0FBQ0osQ0FBQztBQUVELGtGQUFrRjtBQUNsRixNQUFNLFVBQVUseUJBQXlCLENBQ3ZDLFlBQXFCLEVBQ3JCLFFBQWEsRUFDYixTQUFjLEVBQ2QsUUFBNEIsRUFDNUIsS0FBWTtJQUVaLE1BQU0sZ0JBQWdCLEdBQUcsMEJBQTBCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0QsTUFBTSxrQkFBa0IsR0FBRyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO0lBQ3hELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ25ELElBQUksR0FBRyxHQUFHLDJHQUEyRyxLQUFLLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUMvTCxrQkFBa0IsQ0FBQyxDQUFDLENBQUMseUJBQXlCLGtCQUFrQixZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQ2pGLEVBQUUsQ0FBQztJQUNILElBQUksWUFBWSxFQUFFLENBQUM7UUFDakIsR0FBRztZQUNELHFHQUFxRztnQkFDckcsa0RBQWtELENBQUM7SUFDdkQsQ0FBQztJQUNELE1BQU0sSUFBSSxZQUFZLCtEQUFvRCxHQUFHLENBQUMsQ0FBQztBQUNqRixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsS0FBYztJQUNqQyxJQUFJLFFBQVEsR0FBVyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFckMsbURBQW1EO0lBQ25ELElBQUksQ0FBQztRQUNILElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLEtBQUssaUJBQWlCLEVBQUUsQ0FBQztZQUMzRCxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUMsQ0FBQSxDQUFDO0lBQ2xCLE9BQU8sUUFBUSxDQUFDLE1BQU0sR0FBRyx5QkFBeUI7UUFDaEQsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLHlCQUF5QixDQUFDLEdBQUcsR0FBRztRQUN4RCxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQ2YsQ0FBQztBQUVELFNBQVMsZ0NBQWdDLENBQ3ZDLEtBQVksRUFDWixTQUFpQixFQUNqQixlQUF1QixFQUN2QixJQUFZLEVBQ1osWUFBaUI7SUFFakIsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDMUUsSUFBSSxRQUFRLEdBQUcsTUFBTSxFQUNuQixRQUFRLEdBQUcsTUFBTSxDQUFDO0lBQ3BCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDdkMsTUFBTSxPQUFPLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUM5QixRQUFRLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDNUMsUUFBUSxJQUFJLEdBQUcsT0FBTyxLQUFLLGVBQWUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDM0YsQ0FBQztJQUNELE9BQU8sRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLGdDQUFnQyxDQUM5QyxLQUFZLEVBQ1osWUFBb0IsRUFDcEIsUUFBYSxFQUNiLFFBQWE7SUFFYixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ2hDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUVyQyxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ2pDLHNDQUFzQztRQUN0QyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ25ELE9BQU8sZ0NBQWdDLENBQ3JDLEtBQUssRUFDTCxZQUFZLEVBQ1osWUFBWSxFQUNaLFFBQVEsRUFDUixRQUFRLENBQ1QsQ0FBQztRQUNKLENBQUM7UUFDRCxnQ0FBZ0M7UUFDaEMsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCwyRkFBMkY7SUFDM0YsaUdBQWlHO0lBQ2pHLGdHQUFnRztJQUNoRywyREFBMkQ7SUFDM0QsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUcsWUFBWSxHQUFHLENBQUMsQ0FBQztRQUMzQixPQUFPLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ2pFLEdBQUcsRUFBRSxDQUFDO1FBQ1IsQ0FBQztRQUNELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQzdCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyRSw2RkFBNkY7WUFDN0YscUZBQXFGO1lBQ3JGLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQztnQkFDdkQsT0FBTyxnQ0FBZ0MsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDcEYsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDO0FBQ25ELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7UnVudGltZUVycm9yLCBSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi9pbnRlcmZhY2UvdHlwZSc7XG5cbmltcG9ydCB7Z2V0Q29tcG9uZW50RGVmfSBmcm9tICcuL2RlZmluaXRpb24nO1xuaW1wb3J0IHtnZXREZWNsYXJhdGlvbkNvbXBvbmVudERlZn0gZnJvbSAnLi9pbnN0cnVjdGlvbnMvZWxlbWVudF92YWxpZGF0aW9uJztcbmltcG9ydCB7VE5vZGV9IGZyb20gJy4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7TFZpZXcsIFRWSUVXfSBmcm9tICcuL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge0lOVEVSUE9MQVRJT05fREVMSU1JVEVSfSBmcm9tICcuL3V0aWwvbWlzY191dGlscyc7XG5pbXBvcnQge3N0cmluZ2lmeUZvckVycm9yfSBmcm9tICcuL3V0aWwvc3RyaW5naWZ5X3V0aWxzJztcblxuLyoqXG4gKiBUaGUgbWF4IGxlbmd0aCBvZiB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmFsdWUgaW4gYW4gZXJyb3IgbWVzc2FnZVxuICovXG5jb25zdCBWQUxVRV9TVFJJTkdfTEVOR1RIX0xJTUlUID0gMjAwO1xuXG4vKiogVmVyaWZpZXMgdGhhdCBhIGdpdmVuIHR5cGUgaXMgYSBTdGFuZGFsb25lIENvbXBvbmVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRTdGFuZGFsb25lQ29tcG9uZW50VHlwZSh0eXBlOiBUeXBlPHVua25vd24+KSB7XG4gIGFzc2VydENvbXBvbmVudERlZih0eXBlKTtcbiAgY29uc3QgY29tcG9uZW50RGVmID0gZ2V0Q29tcG9uZW50RGVmKHR5cGUpITtcbiAgaWYgKCFjb21wb25lbnREZWYuc3RhbmRhbG9uZSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLlRZUEVfSVNfTk9UX1NUQU5EQUxPTkUsXG4gICAgICBgVGhlICR7c3RyaW5naWZ5Rm9yRXJyb3IodHlwZSl9IGNvbXBvbmVudCBpcyBub3QgbWFya2VkIGFzIHN0YW5kYWxvbmUsIGAgK1xuICAgICAgICBgYnV0IEFuZ3VsYXIgZXhwZWN0cyB0byBoYXZlIGEgc3RhbmRhbG9uZSBjb21wb25lbnQgaGVyZS4gYCArXG4gICAgICAgIGBQbGVhc2UgbWFrZSBzdXJlIHRoZSAke3N0cmluZ2lmeUZvckVycm9yKHR5cGUpfSBjb21wb25lbnQgaGFzIGAgK1xuICAgICAgICBgdGhlIFxcYHN0YW5kYWxvbmU6IHRydWVcXGAgZmxhZyBpbiB0aGUgZGVjb3JhdG9yLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKiogVmVyaWZpZXMgd2hldGhlciBhIGdpdmVuIHR5cGUgaXMgYSBjb21wb25lbnQgKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRDb21wb25lbnREZWYodHlwZTogVHlwZTx1bmtub3duPikge1xuICBpZiAoIWdldENvbXBvbmVudERlZih0eXBlKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfR0VORVJBVEVEX0RFRixcbiAgICAgIGBUaGUgJHtzdHJpbmdpZnlGb3JFcnJvcih0eXBlKX0gaXMgbm90IGFuIEFuZ3VsYXIgY29tcG9uZW50LCBgICtcbiAgICAgICAgYG1ha2Ugc3VyZSBpdCBoYXMgdGhlIFxcYEBDb21wb25lbnRcXGAgZGVjb3JhdG9yLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKiogQ2FsbGVkIHdoZW4gdGhlcmUgYXJlIG11bHRpcGxlIGNvbXBvbmVudCBzZWxlY3RvcnMgdGhhdCBtYXRjaCBhIGdpdmVuIG5vZGUgKi9cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd011bHRpcGxlQ29tcG9uZW50RXJyb3IoXG4gIHROb2RlOiBUTm9kZSxcbiAgZmlyc3Q6IFR5cGU8dW5rbm93bj4sXG4gIHNlY29uZDogVHlwZTx1bmtub3duPixcbik6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICBSdW50aW1lRXJyb3JDb2RlLk1VTFRJUExFX0NPTVBPTkVOVFNfTUFUQ0gsXG4gICAgYE11bHRpcGxlIGNvbXBvbmVudHMgbWF0Y2ggbm9kZSB3aXRoIHRhZ25hbWUgJHt0Tm9kZS52YWx1ZX06IGAgK1xuICAgICAgYCR7c3RyaW5naWZ5Rm9yRXJyb3IoZmlyc3QpfSBhbmQgYCArXG4gICAgICBgJHtzdHJpbmdpZnlGb3JFcnJvcihzZWNvbmQpfWAsXG4gICk7XG59XG5cbi8qKiBUaHJvd3MgYW4gRXhwcmVzc2lvbkNoYW5nZWRBZnRlckNoZWNrZWQgZXJyb3IgaWYgY2hlY2tOb0NoYW5nZXMgbW9kZSBpcyBvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0Vycm9ySWZOb0NoYW5nZXNNb2RlKFxuICBjcmVhdGlvbk1vZGU6IGJvb2xlYW4sXG4gIG9sZFZhbHVlOiBhbnksXG4gIGN1cnJWYWx1ZTogYW55LFxuICBwcm9wTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICBsVmlldzogTFZpZXcsXG4pOiBuZXZlciB7XG4gIGNvbnN0IGhvc3RDb21wb25lbnREZWYgPSBnZXREZWNsYXJhdGlvbkNvbXBvbmVudERlZihsVmlldyk7XG4gIGNvbnN0IGNvbXBvbmVudENsYXNzTmFtZSA9IGhvc3RDb21wb25lbnREZWY/LnR5cGU/Lm5hbWU7XG4gIGNvbnN0IGZpZWxkID0gcHJvcE5hbWUgPyBgIGZvciAnJHtwcm9wTmFtZX0nYCA6ICcnO1xuICBsZXQgbXNnID0gYEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXJyb3I6IEV4cHJlc3Npb24gaGFzIGNoYW5nZWQgYWZ0ZXIgaXQgd2FzIGNoZWNrZWQuIFByZXZpb3VzIHZhbHVlJHtmaWVsZH06ICcke2Zvcm1hdFZhbHVlKG9sZFZhbHVlKX0nLiBDdXJyZW50IHZhbHVlOiAnJHtmb3JtYXRWYWx1ZShjdXJyVmFsdWUpfScuJHtcbiAgICBjb21wb25lbnRDbGFzc05hbWUgPyBgIEV4cHJlc3Npb24gbG9jYXRpb246ICR7Y29tcG9uZW50Q2xhc3NOYW1lfSBjb21wb25lbnRgIDogJydcbiAgfWA7XG4gIGlmIChjcmVhdGlvbk1vZGUpIHtcbiAgICBtc2cgKz1cbiAgICAgIGAgSXQgc2VlbXMgbGlrZSB0aGUgdmlldyBoYXMgYmVlbiBjcmVhdGVkIGFmdGVyIGl0cyBwYXJlbnQgYW5kIGl0cyBjaGlsZHJlbiBoYXZlIGJlZW4gZGlydHkgY2hlY2tlZC5gICtcbiAgICAgIGAgSGFzIGl0IGJlZW4gY3JlYXRlZCBpbiBhIGNoYW5nZSBkZXRlY3Rpb24gaG9vaz9gO1xuICB9XG4gIHRocm93IG5ldyBSdW50aW1lRXJyb3IoUnVudGltZUVycm9yQ29kZS5FWFBSRVNTSU9OX0NIQU5HRURfQUZURVJfQ0hFQ0tFRCwgbXNnKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICBsZXQgc3RyVmFsdWU6IHN0cmluZyA9IFN0cmluZyh2YWx1ZSk7XG5cbiAgLy8gSlNPTi5zdHJpbmdpZnkgd2lsbCB0aHJvdyBvbiBjaXJjdWxhciByZWZlcmVuY2VzXG4gIHRyeSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpIHx8IHN0clZhbHVlID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgc3RyVmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge31cbiAgcmV0dXJuIHN0clZhbHVlLmxlbmd0aCA+IFZBTFVFX1NUUklOR19MRU5HVEhfTElNSVRcbiAgICA/IHN0clZhbHVlLnN1YnN0cmluZygwLCBWQUxVRV9TVFJJTkdfTEVOR1RIX0xJTUlUKSArICfigKYnXG4gICAgOiBzdHJWYWx1ZTtcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0RGV0YWlsc0ZvckludGVycG9sYXRpb24oXG4gIGxWaWV3OiBMVmlldyxcbiAgcm9vdEluZGV4OiBudW1iZXIsXG4gIGV4cHJlc3Npb25JbmRleDogbnVtYmVyLFxuICBtZXRhOiBzdHJpbmcsXG4gIGNoYW5nZWRWYWx1ZTogYW55LFxuKSB7XG4gIGNvbnN0IFtwcm9wTmFtZSwgcHJlZml4LCAuLi5jaHVua3NdID0gbWV0YS5zcGxpdChJTlRFUlBPTEFUSU9OX0RFTElNSVRFUik7XG4gIGxldCBvbGRWYWx1ZSA9IHByZWZpeCxcbiAgICBuZXdWYWx1ZSA9IHByZWZpeDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzbG90SWR4ID0gcm9vdEluZGV4ICsgaTtcbiAgICBvbGRWYWx1ZSArPSBgJHtsVmlld1tzbG90SWR4XX0ke2NodW5rc1tpXX1gO1xuICAgIG5ld1ZhbHVlICs9IGAke3Nsb3RJZHggPT09IGV4cHJlc3Npb25JbmRleCA/IGNoYW5nZWRWYWx1ZSA6IGxWaWV3W3Nsb3RJZHhdfSR7Y2h1bmtzW2ldfWA7XG4gIH1cbiAgcmV0dXJuIHtwcm9wTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlfTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGRldGFpbHMgZm9yIHRoZSBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEVycm9yOlxuICogLSBwcm9wZXJ0eSBuYW1lIChmb3IgcHJvcGVydHkgYmluZGluZ3Mgb3IgaW50ZXJwb2xhdGlvbnMpXG4gKiAtIG9sZCBhbmQgbmV3IHZhbHVlcywgZW5yaWNoZWQgdXNpbmcgaW5mb3JtYXRpb24gZnJvbSBtZXRhZGF0YVxuICpcbiAqIE1vcmUgaW5mb3JtYXRpb24gb24gdGhlIG1ldGFkYXRhIHN0b3JhZ2UgZm9ybWF0IGNhbiBiZSBmb3VuZCBpbiBgc3RvcmVQcm9wZXJ0eUJpbmRpbmdNZXRhZGF0YWBcbiAqIGZ1bmN0aW9uIGRlc2NyaXB0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhwcmVzc2lvbkNoYW5nZWRFcnJvckRldGFpbHMoXG4gIGxWaWV3OiBMVmlldyxcbiAgYmluZGluZ0luZGV4OiBudW1iZXIsXG4gIG9sZFZhbHVlOiBhbnksXG4gIG5ld1ZhbHVlOiBhbnksXG4pOiB7cHJvcE5hbWU/OiBzdHJpbmc7IG9sZFZhbHVlOiBhbnk7IG5ld1ZhbHVlOiBhbnl9IHtcbiAgY29uc3QgdERhdGEgPSBsVmlld1tUVklFV10uZGF0YTtcbiAgY29uc3QgbWV0YWRhdGEgPSB0RGF0YVtiaW5kaW5nSW5kZXhdO1xuXG4gIGlmICh0eXBlb2YgbWV0YWRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gbWV0YWRhdGEgZm9yIHByb3BlcnR5IGludGVycG9sYXRpb25cbiAgICBpZiAobWV0YWRhdGEuaW5kZXhPZihJTlRFUlBPTEFUSU9OX0RFTElNSVRFUikgPiAtMSkge1xuICAgICAgcmV0dXJuIGNvbnN0cnVjdERldGFpbHNGb3JJbnRlcnBvbGF0aW9uKFxuICAgICAgICBsVmlldyxcbiAgICAgICAgYmluZGluZ0luZGV4LFxuICAgICAgICBiaW5kaW5nSW5kZXgsXG4gICAgICAgIG1ldGFkYXRhLFxuICAgICAgICBuZXdWYWx1ZSxcbiAgICAgICk7XG4gICAgfVxuICAgIC8vIG1ldGFkYXRhIGZvciBwcm9wZXJ0eSBiaW5kaW5nXG4gICAgcmV0dXJuIHtwcm9wTmFtZTogbWV0YWRhdGEsIG9sZFZhbHVlLCBuZXdWYWx1ZX07XG4gIH1cblxuICAvLyBtZXRhZGF0YSBpcyBub3QgYXZhaWxhYmxlIGZvciB0aGlzIGV4cHJlc3Npb24sIGNoZWNrIGlmIHRoaXMgZXhwcmVzc2lvbiBpcyBhIHBhcnQgb2YgdGhlXG4gIC8vIHByb3BlcnR5IGludGVycG9sYXRpb24gYnkgZ29pbmcgZnJvbSB0aGUgY3VycmVudCBiaW5kaW5nIGluZGV4IGxlZnQgYW5kIGxvb2sgZm9yIGEgc3RyaW5nIHRoYXRcbiAgLy8gY29udGFpbnMgSU5URVJQT0xBVElPTl9ERUxJTUlURVIsIHRoZSBsYXlvdXQgaW4gdFZpZXcuZGF0YSBmb3IgdGhpcyBjYXNlIHdpbGwgbG9vayBsaWtlIHRoaXM6XG4gIC8vIFsuLi4sICdpZO+/vVByZWZpeCDvv70gYW5kIO+/vSBzdWZmaXgnLCBudWxsLCBudWxsLCBudWxsLCAuLi5dXG4gIGlmIChtZXRhZGF0YSA9PT0gbnVsbCkge1xuICAgIGxldCBpZHggPSBiaW5kaW5nSW5kZXggLSAxO1xuICAgIHdoaWxlICh0eXBlb2YgdERhdGFbaWR4XSAhPT0gJ3N0cmluZycgJiYgdERhdGFbaWR4ICsgMV0gPT09IG51bGwpIHtcbiAgICAgIGlkeC0tO1xuICAgIH1cbiAgICBjb25zdCBtZXRhID0gdERhdGFbaWR4XTtcbiAgICBpZiAodHlwZW9mIG1ldGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBtYXRjaGVzID0gbWV0YS5tYXRjaChuZXcgUmVnRXhwKElOVEVSUE9MQVRJT05fREVMSU1JVEVSLCAnZycpKTtcbiAgICAgIC8vIGZpcnN0IGludGVycG9sYXRpb24gZGVsaW1pdGVyIHNlcGFyYXRlcyBwcm9wZXJ0eSBuYW1lIGZyb20gaW50ZXJwb2xhdGlvbiBwYXJ0cyAoaW4gY2FzZSBvZlxuICAgICAgLy8gcHJvcGVydHkgaW50ZXJwb2xhdGlvbnMpLCBzbyB3ZSBzdWJ0cmFjdCBvbmUgZnJvbSB0b3RhbCBudW1iZXIgb2YgZm91bmQgZGVsaW1pdGVyc1xuICAgICAgaWYgKG1hdGNoZXMgJiYgbWF0Y2hlcy5sZW5ndGggLSAxID4gYmluZGluZ0luZGV4IC0gaWR4KSB7XG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3REZXRhaWxzRm9ySW50ZXJwb2xhdGlvbihsVmlldywgaWR4LCBiaW5kaW5nSW5kZXgsIG1ldGEsIG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtwcm9wTmFtZTogdW5kZWZpbmVkLCBvbGRWYWx1ZSwgbmV3VmFsdWV9O1xufVxuIl19