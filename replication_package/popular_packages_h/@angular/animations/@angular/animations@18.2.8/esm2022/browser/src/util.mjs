/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AnimationMetadataType, sequence, } from '@angular/animations';
import { invalidNodeType, invalidParamValue, invalidStyleParams, invalidTimingValue, negativeDelayValue, negativeStepValue, } from './error_helpers';
const ONE_SECOND = 1000;
export const SUBSTITUTION_EXPR_START = '{{';
export const SUBSTITUTION_EXPR_END = '}}';
export const ENTER_CLASSNAME = 'ng-enter';
export const LEAVE_CLASSNAME = 'ng-leave';
export const NG_TRIGGER_CLASSNAME = 'ng-trigger';
export const NG_TRIGGER_SELECTOR = '.ng-trigger';
export const NG_ANIMATING_CLASSNAME = 'ng-animating';
export const NG_ANIMATING_SELECTOR = '.ng-animating';
export function resolveTimingValue(value) {
    if (typeof value == 'number')
        return value;
    const matches = value.match(/^(-?[\.\d]+)(m?s)/);
    if (!matches || matches.length < 2)
        return 0;
    return _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
}
function _convertTimeValueToMS(value, unit) {
    switch (unit) {
        case 's':
            return value * ONE_SECOND;
        default: // ms or something else
            return value;
    }
}
export function resolveTiming(timings, errors, allowNegativeValues) {
    return timings.hasOwnProperty('duration')
        ? timings
        : parseTimeExpression(timings, errors, allowNegativeValues);
}
function parseTimeExpression(exp, errors, allowNegativeValues) {
    const regex = /^(-?[\.\d]+)(m?s)(?:\s+(-?[\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
    let duration;
    let delay = 0;
    let easing = '';
    if (typeof exp === 'string') {
        const matches = exp.match(regex);
        if (matches === null) {
            errors.push(invalidTimingValue(exp));
            return { duration: 0, delay: 0, easing: '' };
        }
        duration = _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
        const delayMatch = matches[3];
        if (delayMatch != null) {
            delay = _convertTimeValueToMS(parseFloat(delayMatch), matches[4]);
        }
        const easingVal = matches[5];
        if (easingVal) {
            easing = easingVal;
        }
    }
    else {
        duration = exp;
    }
    if (!allowNegativeValues) {
        let containsErrors = false;
        let startIndex = errors.length;
        if (duration < 0) {
            errors.push(negativeStepValue());
            containsErrors = true;
        }
        if (delay < 0) {
            errors.push(negativeDelayValue());
            containsErrors = true;
        }
        if (containsErrors) {
            errors.splice(startIndex, 0, invalidTimingValue(exp));
        }
    }
    return { duration, delay, easing };
}
export function normalizeKeyframes(keyframes) {
    if (!keyframes.length) {
        return [];
    }
    if (keyframes[0] instanceof Map) {
        return keyframes;
    }
    return keyframes.map((kf) => new Map(Object.entries(kf)));
}
export function normalizeStyles(styles) {
    return Array.isArray(styles) ? new Map(...styles) : new Map(styles);
}
export function setStyles(element, styles, formerStyles) {
    styles.forEach((val, prop) => {
        const camelProp = dashCaseToCamelCase(prop);
        if (formerStyles && !formerStyles.has(prop)) {
            formerStyles.set(prop, element.style[camelProp]);
        }
        element.style[camelProp] = val;
    });
}
export function eraseStyles(element, styles) {
    styles.forEach((_, prop) => {
        const camelProp = dashCaseToCamelCase(prop);
        element.style[camelProp] = '';
    });
}
export function normalizeAnimationEntry(steps) {
    if (Array.isArray(steps)) {
        if (steps.length == 1)
            return steps[0];
        return sequence(steps);
    }
    return steps;
}
export function validateStyleParams(value, options, errors) {
    const params = options.params || {};
    const matches = extractStyleParams(value);
    if (matches.length) {
        matches.forEach((varName) => {
            if (!params.hasOwnProperty(varName)) {
                errors.push(invalidStyleParams(varName));
            }
        });
    }
}
const PARAM_REGEX = new RegExp(`${SUBSTITUTION_EXPR_START}\\s*(.+?)\\s*${SUBSTITUTION_EXPR_END}`, 'g');
export function extractStyleParams(value) {
    let params = [];
    if (typeof value === 'string') {
        let match;
        while ((match = PARAM_REGEX.exec(value))) {
            params.push(match[1]);
        }
        PARAM_REGEX.lastIndex = 0;
    }
    return params;
}
export function interpolateParams(value, params, errors) {
    const original = `${value}`;
    const str = original.replace(PARAM_REGEX, (_, varName) => {
        let localVal = params[varName];
        // this means that the value was never overridden by the data passed in by the user
        if (localVal == null) {
            errors.push(invalidParamValue(varName));
            localVal = '';
        }
        return localVal.toString();
    });
    // we do this to assert that numeric values stay as they are
    return str == original ? value : str;
}
const DASH_CASE_REGEXP = /-+([a-z0-9])/g;
export function dashCaseToCamelCase(input) {
    return input.replace(DASH_CASE_REGEXP, (...m) => m[1].toUpperCase());
}
export function camelCaseToDashCase(input) {
    return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
export function allowPreviousPlayerStylesMerge(duration, delay) {
    return duration === 0 || delay === 0;
}
export function balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles) {
    if (previousStyles.size && keyframes.length) {
        let startingKeyframe = keyframes[0];
        let missingStyleProps = [];
        previousStyles.forEach((val, prop) => {
            if (!startingKeyframe.has(prop)) {
                missingStyleProps.push(prop);
            }
            startingKeyframe.set(prop, val);
        });
        if (missingStyleProps.length) {
            for (let i = 1; i < keyframes.length; i++) {
                let kf = keyframes[i];
                missingStyleProps.forEach((prop) => kf.set(prop, computeStyle(element, prop)));
            }
        }
    }
    return keyframes;
}
export function visitDslNode(visitor, node, context) {
    switch (node.type) {
        case AnimationMetadataType.Trigger:
            return visitor.visitTrigger(node, context);
        case AnimationMetadataType.State:
            return visitor.visitState(node, context);
        case AnimationMetadataType.Transition:
            return visitor.visitTransition(node, context);
        case AnimationMetadataType.Sequence:
            return visitor.visitSequence(node, context);
        case AnimationMetadataType.Group:
            return visitor.visitGroup(node, context);
        case AnimationMetadataType.Animate:
            return visitor.visitAnimate(node, context);
        case AnimationMetadataType.Keyframes:
            return visitor.visitKeyframes(node, context);
        case AnimationMetadataType.Style:
            return visitor.visitStyle(node, context);
        case AnimationMetadataType.Reference:
            return visitor.visitReference(node, context);
        case AnimationMetadataType.AnimateChild:
            return visitor.visitAnimateChild(node, context);
        case AnimationMetadataType.AnimateRef:
            return visitor.visitAnimateRef(node, context);
        case AnimationMetadataType.Query:
            return visitor.visitQuery(node, context);
        case AnimationMetadataType.Stagger:
            return visitor.visitStagger(node, context);
        default:
            throw invalidNodeType(node.type);
    }
}
export function computeStyle(element, prop) {
    return window.getComputedStyle(element)[prop];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBR0wscUJBQXFCLEVBRXJCLFFBQVEsR0FHVCxNQUFNLHFCQUFxQixDQUFDO0FBSTdCLE9BQU8sRUFDTCxlQUFlLEVBQ2YsaUJBQWlCLEVBQ2pCLGtCQUFrQixFQUNsQixrQkFBa0IsRUFDbEIsa0JBQWtCLEVBQ2xCLGlCQUFpQixHQUNsQixNQUFNLGlCQUFpQixDQUFDO0FBRXpCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQztBQUV4QixNQUFNLENBQUMsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUM7QUFDNUMsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDO0FBQzFDLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUM7QUFDMUMsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLFVBQVUsQ0FBQztBQUMxQyxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxZQUFZLENBQUM7QUFDakQsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsYUFBYSxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLGNBQWMsQ0FBQztBQUNyRCxNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxlQUFlLENBQUM7QUFFckQsTUFBTSxVQUFVLGtCQUFrQixDQUFDLEtBQXNCO0lBQ3ZELElBQUksT0FBTyxLQUFLLElBQUksUUFBUTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBRTNDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNqRCxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQztRQUFFLE9BQU8sQ0FB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cHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cbmltcG9ydCB7XG4gIEFuaW1hdGVUaW1pbmdzLFxuICBBbmltYXRpb25NZXRhZGF0YSxcbiAgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLFxuICBBbmltYXRpb25PcHRpb25zLFxuICBzZXF1ZW5jZSxcbiAgybVTdHlsZURhdGEsXG4gIMm1U3R5bGVEYXRhTWFwLFxufSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuaW1wb3J0IHtBc3QgYXMgQW5pbWF0aW9uQXN0LCBBc3RWaXNpdG9yIGFzIEFuaW1hdGlvbkFzdFZpc2l0b3J9IGZyb20gJy4vZHNsL2FuaW1hdGlvbl9hc3QnO1xuaW1wb3J0IHtBbmltYXRpb25Ec2xWaXNpdG9yfSBmcm9tICcuL2RzbC9hbmltYXRpb25fZHNsX3Zpc2l0b3InO1xuaW1wb3J0IHtcbiAgaW52YWxpZE5vZGVUeXBlLFxuICBpbnZhbGlkUGFyYW1WYWx1ZSxcbiAgaW52YWxpZFN0eWxlUGFyYW1zLFxuICBpbnZhbGlkVGltaW5nVmFsdWUsXG4gIG5lZ2F0aXZlRGVsYXlWYWx1ZSxcbiAgbmVnYXRpdmVTdGVwVmFsdWUsXG59IGZyb20gJy4vZXJyb3JfaGVscGVycyc7XG5cbmNvbnN0IE9ORV9TRUNPTkQgPSAxMDAwO1xuXG5leHBvcnQgY29uc3QgU1VCU1RJVFVUSU9OX0VYUFJfU1RBUlQgPSAne3snO1xuZXhwb3J0IGNvbnN0IFNVQlNUSVRVVElPTl9FWFBSX0VORCA9ICd9fSc7XG5leHBvcnQgY29uc3QgRU5URVJfQ0xBU1NOQU1FID0gJ25nLWVudGVyJztcbmV4cG9ydCBjb25zdCBMRUFWRV9DTEFTU05BTUUgPSAnbmctbGVhdmUnO1xuZXhwb3J0IGNvbnN0IE5HX1RSSUdHRVJfQ0xBU1NOQU1FID0gJ25nLXRyaWdnZXInO1xuZXhwb3J0IGNvbnN0IE5HX1RSSUdHRVJfU0VMRUNUT1IgPSAnLm5nLXRyaWdnZXInO1xuZXhwb3J0IGNvbnN0IE5HX0FOSU1BVElOR19DTEFTU05BTUUgPSAnbmctYW5pbWF0aW5nJztcbmV4cG9ydCBjb25zdCBOR19BTklNQVRJTkdfU0VMRUNUT1IgPSAnLm5nLWFuaW1hdGluZyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlVGltaW5nVmFsdWUodmFsdWU6IHN0cmluZyB8IG51bWJlcikge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSByZXR1cm4gdmFsdWU7XG5cbiAgY29uc3QgbWF0Y2hlcyA9IHZhbHVlLm1hdGNoKC9eKC0/W1xcLlxcZF0rKShtP3MpLyk7XG4gIGlmICghbWF0Y2hlcyB8fCBtYXRjaGVzLmxlbmd0aCA8IDIpIHJldHVybiAwO1xuXG4gIHJldHVybiBfY29udmVydFRpbWVWYWx1ZVRvTVMocGFyc2VGbG9hdChtYXRjaGVzWzFdKSwgbWF0Y2hlc1syXSk7XG59XG5cbmZ1bmN0aW9uIF9jb252ZXJ0VGltZVZhbHVlVG9NUyh2YWx1ZTogbnVtYmVyLCB1bml0OiBzdHJpbmcpOiBudW1iZXIge1xuICBzd2l0Y2ggKHVuaXQpIHtcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiB2YWx1ZSAqIE9ORV9TRUNPTkQ7XG4gICAgZGVmYXVsdDogLy8gbXMgb3Igc29tZXRoaW5nIGVsc2VcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVRpbWluZyhcbiAgdGltaW5nczogc3RyaW5nIHwgbnVtYmVyIHwgQW5pbWF0ZVRpbWluZ3MsXG4gIGVycm9yczogRXJyb3JbXSxcbiAgYWxsb3dOZWdhdGl2ZVZhbHVlcz86IGJvb2xlYW4sXG4pIHtcbiAgcmV0dXJuIHRpbWluZ3MuaGFzT3duUHJvcGVydHkoJ2R1cmF0aW9uJylcbiAgICA/IDxBbmltYXRlVGltaW5ncz50aW1pbmdzXG4gICAgOiBwYXJzZVRpbWVFeHByZXNzaW9uKDxzdHJpbmcgfCBudW1iZXI+dGltaW5ncywgZXJyb3JzLCBhbGxvd05lZ2F0aXZlVmFsdWVzKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VUaW1lRXhwcmVzc2lvbihcbiAgZXhwOiBzdHJpbmcgfCBudW1iZXIsXG4gIGVycm9yczogRXJyb3JbXSxcbiAgYWxsb3dOZWdhdGl2ZVZhbHVlcz86IGJvb2xlYW4sXG4pOiBBbmltYXRlVGltaW5ncyB7XG4gIGNvbnN0IHJlZ2V4ID0gL14oLT9bXFwuXFxkXSspKG0/cykoPzpcXHMrKC0/W1xcLlxcZF0rKShtP3MpKT8oPzpcXHMrKFstYS16XSsoPzpcXCguKz9cXCkpPykpPyQvaTtcbiAgbGV0IGR1cmF0aW9uOiBudW1iZXI7XG4gIGxldCBkZWxheTogbnVtYmVyID0gMDtcbiAgbGV0IGVhc2luZzogc3RyaW5nID0gJyc7XG4gIGlmICh0eXBlb2YgZXhwID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IG1hdGNoZXMgPSBleHAubWF0Y2gocmVnZXgpO1xuICAgIGlmIChtYXRjaGVzID09PSBudWxsKSB7XG4gICAgICBlcnJvcnMucHVzaChpbnZhbGlkVGltaW5nVmFsdWUoZXhwKSk7XG4gICAgICByZXR1cm4ge2R1cmF0aW9uOiAwLCBkZWxheTogMCwgZWFzaW5nOiAnJ307XG4gICAgfVxuXG4gICAgZHVyYXRpb24gPSBfY29udmVydFRpbWVWYWx1ZVRvTVMocGFyc2VGbG9hdChtYXRjaGVzWzFdKSwgbWF0Y2hlc1syXSk7XG5cbiAgICBjb25zdCBkZWxheU1hdGNoID0gbWF0Y2hlc1szXTtcbiAgICBpZiAoZGVsYXlNYXRjaCAhPSBudWxsKSB7XG4gICAgICBkZWxheSA9IF9jb252ZXJ0VGltZVZhbHVlVG9NUyhwYXJzZUZsb2F0KGRlbGF5TWF0Y2gpLCBtYXRjaGVzWzRdKTtcbiAgICB9XG5cbiAgICBjb25zdCBlYXNpbmdWYWwgPSBtYXRjaGVzWzVdO1xuICAgIGlmIChlYXNpbmdWYWwpIHtcbiAgICAgIGVhc2luZyA9IGVhc2luZ1ZhbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZHVyYXRpb24gPSBleHA7XG4gIH1cblxuICBpZiAoIWFsbG93TmVnYXRpdmVWYWx1ZXMpIHtcbiAgICBsZXQgY29udGFpbnNFcnJvcnMgPSBmYWxzZTtcbiAgICBsZXQgc3RhcnRJbmRleCA9IGVycm9ycy5sZW5ndGg7XG4gICAgaWYgKGR1cmF0aW9uIDwgMCkge1xuICAgICAgZXJyb3JzLnB1c2gobmVnYXRpdmVTdGVwVmFsdWUoKSk7XG4gICAgICBjb250YWluc0Vycm9ycyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChkZWxheSA8IDApIHtcbiAgICAgIGVycm9ycy5wdXNoKG5lZ2F0aXZlRGVsYXlWYWx1ZSgpKTtcbiAgICAgIGNvbnRhaW5zRXJyb3JzID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNvbnRhaW5zRXJyb3JzKSB7XG4gICAgICBlcnJvcnMuc3BsaWNlKHN0YXJ0SW5kZXgsIDAsIGludmFsaWRUaW1pbmdWYWx1ZShleHApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge2R1cmF0aW9uLCBkZWxheSwgZWFzaW5nfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUtleWZyYW1lcyhcbiAga2V5ZnJhbWVzOiBBcnJheTzJtVN0eWxlRGF0YT4gfCBBcnJheTzJtVN0eWxlRGF0YU1hcD4sXG4pOiBBcnJheTzJtVN0eWxlRGF0YU1hcD4ge1xuICBpZiAoIWtleWZyYW1lcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgaWYgKGtleWZyYW1lc1swXSBpbnN0YW5jZW9mIE1hcCkge1xuICAgIHJldHVybiBrZXlmcmFtZXMgYXMgQXJyYXk8ybVTdHlsZURhdGFNYXA+O1xuICB9XG4gIHJldHVybiBrZXlmcmFtZXMubWFwKChrZikgPT4gbmV3IE1hcChPYmplY3QuZW50cmllcyhrZikpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVN0eWxlcyhzdHlsZXM6IMm1U3R5bGVEYXRhTWFwIHwgQXJyYXk8ybVTdHlsZURhdGFNYXA+KTogybVTdHlsZURhdGFNYXAge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShzdHlsZXMpID8gbmV3IE1hcCguLi5zdHlsZXMpIDogbmV3IE1hcChzdHlsZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U3R5bGVzKGVsZW1lbnQ6IGFueSwgc3R5bGVzOiDJtVN0eWxlRGF0YU1hcCwgZm9ybWVyU3R5bGVzPzogybVTdHlsZURhdGFNYXApIHtcbiAgc3R5bGVzLmZvckVhY2goKHZhbCwgcHJvcCkgPT4ge1xuICAgIGNvbnN0IGNhbWVsUHJvcCA9IGRhc2hDYXNlVG9DYW1lbENhc2UocHJvcCk7XG4gICAgaWYgKGZvcm1lclN0eWxlcyAmJiAhZm9ybWVyU3R5bGVzLmhhcyhwcm9wKSkge1xuICAgICAgZm9ybWVyU3R5bGVzLnNldChwcm9wLCBlbGVtZW50LnN0eWxlW2NhbWVsUHJvcF0pO1xuICAgIH1cbiAgICBlbGVtZW50LnN0eWxlW2NhbWVsUHJvcF0gPSB2YWw7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXJhc2VTdHlsZXMoZWxlbWVudDogYW55LCBzdHlsZXM6IMm1U3R5bGVEYXRhTWFwKSB7XG4gIHN0eWxlcy5mb3JFYWNoKChfLCBwcm9wKSA9PiB7XG4gICAgY29uc3QgY2FtZWxQcm9wID0gZGFzaENhc2VUb0NhbWVsQ2FzZShwcm9wKTtcbiAgICBlbGVtZW50LnN0eWxlW2NhbWVsUHJvcF0gPSAnJztcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVBbmltYXRpb25FbnRyeShcbiAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbik6IEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc3RlcHMpKSB7XG4gICAgaWYgKHN0ZXBzLmxlbmd0aCA9PSAxKSByZXR1cm4gc3RlcHNbMF07XG4gICAgcmV0dXJuIHNlcXVlbmNlKHN0ZXBzKTtcbiAgfVxuICByZXR1cm4gc3RlcHMgYXMgQW5pbWF0aW9uTWV0YWRhdGE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVN0eWxlUGFyYW1zKFxuICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyxcbiAgZXJyb3JzOiBFcnJvcltdLFxuKSB7XG4gIGNvbnN0IHBhcmFtcyA9IG9wdGlvbnMucGFyYW1zIHx8IHt9O1xuICBjb25zdCBtYXRjaGVzID0gZXh0cmFjdFN0eWxlUGFyYW1zKHZhbHVlKTtcbiAgaWYgKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgbWF0Y2hlcy5mb3JFYWNoKCh2YXJOYW1lKSA9PiB7XG4gICAgICBpZiAoIXBhcmFtcy5oYXNPd25Qcm9wZXJ0eSh2YXJOYW1lKSkge1xuICAgICAgICBlcnJvcnMucHVzaChpbnZhbGlkU3R5bGVQYXJhbXModmFyTmFtZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IFBBUkFNX1JFR0VYID0gbmV3IFJlZ0V4cChcbiAgYCR7U1VCU1RJVFVUSU9OX0VYUFJfU1RBUlR9XFxcXHMqKC4rPylcXFxccyoke1NVQlNUSVRVVElPTl9FWFBSX0VORH1gLFxuICAnZycsXG4pO1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RTdHlsZVBhcmFtcyh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCk6IHN0cmluZ1tdIHtcbiAgbGV0IHBhcmFtczogc3RyaW5nW10gPSBbXTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICBsZXQgbWF0Y2g6IGFueTtcbiAgICB3aGlsZSAoKG1hdGNoID0gUEFSQU1fUkVHRVguZXhlYyh2YWx1ZSkpKSB7XG4gICAgICBwYXJhbXMucHVzaChtYXRjaFsxXSBhcyBzdHJpbmcpO1xuICAgIH1cbiAgICBQQVJBTV9SRUdFWC5sYXN0SW5kZXggPSAwO1xuICB9XG4gIHJldHVybiBwYXJhbXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnBvbGF0ZVBhcmFtcyhcbiAgdmFsdWU6IHN0cmluZyB8IG51bWJlcixcbiAgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX0sXG4gIGVycm9yczogRXJyb3JbXSxcbik6IHN0cmluZyB8IG51bWJlciB7XG4gIGNvbnN0IG9yaWdpbmFsID0gYCR7dmFsdWV9YDtcbiAgY29uc3Qgc3RyID0gb3JpZ2luYWwucmVwbGFjZShQQVJBTV9SRUdFWCwgKF8sIHZhck5hbWUpID0+IHtcbiAgICBsZXQgbG9jYWxWYWwgPSBwYXJhbXNbdmFyTmFtZV07XG4gICAgLy8gdGhpcyBtZWFucyB0aGF0IHRoZSB2YWx1ZSB3YXMgbmV2ZXIgb3ZlcnJpZGRlbiBieSB0aGUgZGF0YSBwYXNzZWQgaW4gYnkgdGhlIHVzZXJcbiAgICBpZiAobG9jYWxWYWwgPT0gbnVsbCkge1xuICAgICAgZXJyb3JzLnB1c2goaW52YWxpZFBhcmFtVmFsdWUodmFyTmFtZSkpO1xuICAgICAgbG9jYWxWYWwgPSAnJztcbiAgICB9XG4gICAgcmV0dXJuIGxvY2FsVmFsLnRvU3RyaW5nKCk7XG4gIH0pO1xuXG4gIC8vIHdlIGRvIHRoaXMgdG8gYXNzZXJ0IHRoYXQgbnVtZXJpYyB2YWx1ZXMgc3RheSBhcyB0aGV5IGFyZVxuICByZXR1cm4gc3RyID09IG9yaWdpbmFsID8gdmFsdWUgOiBzdHI7XG59XG5cbmNvbnN0IERBU0hfQ0FTRV9SRUdFWFAgPSAvLSsoW2EtejAtOV0pL2c7XG5leHBvcnQgZnVuY3Rpb24gZGFzaENhc2VUb0NhbWVsQ2FzZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoREFTSF9DQVNFX1JFR0VYUCwgKC4uLm06IGFueVtdKSA9PiBtWzFdLnRvVXBwZXJDYXNlKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FtZWxDYXNlVG9EYXNoQ2FzZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGxvd1ByZXZpb3VzUGxheWVyU3R5bGVzTWVyZ2UoZHVyYXRpb246IG51bWJlciwgZGVsYXk6IG51bWJlcikge1xuICByZXR1cm4gZHVyYXRpb24gPT09IDAgfHwgZGVsYXkgPT09IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYWxhbmNlUHJldmlvdXNTdHlsZXNJbnRvS2V5ZnJhbWVzKFxuICBlbGVtZW50OiBhbnksXG4gIGtleWZyYW1lczogQXJyYXk8ybVTdHlsZURhdGFNYXA+LFxuICBwcmV2aW91c1N0eWxlczogybVTdHlsZURhdGFNYXAsXG4pIHtcbiAgaWYgKHByZXZpb3VzU3R5bGVzLnNpemUgJiYga2V5ZnJhbWVzLmxlbmd0aCkge1xuICAgIGxldCBzdGFydGluZ0tleWZyYW1lID0ga2V5ZnJhbWVzWzBdO1xuICAgIGxldCBtaXNzaW5nU3R5bGVQcm9wczogc3RyaW5nW10gPSBbXTtcbiAgICBwcmV2aW91c1N0eWxlcy5mb3JFYWNoKCh2YWwsIHByb3ApID0+IHtcbiAgICAgIGlmICghc3RhcnRpbmdLZXlmcmFtZS5oYXMocHJvcCkpIHtcbiAgICAgICAgbWlzc2luZ1N0eWxlUHJvcHMucHVzaChwcm9wKTtcbiAgICAgIH1cbiAgICAgIHN0YXJ0aW5nS2V5ZnJhbWUuc2V0KHByb3AsIHZhbCk7XG4gICAgfSk7XG5cbiAgICBpZiAobWlzc2luZ1N0eWxlUHJvcHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGtleWZyYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQga2YgPSBrZXlmcmFtZXNbaV07XG4gICAgICAgIG1pc3NpbmdTdHlsZVByb3BzLmZvckVhY2goKHByb3ApID0+IGtmLnNldChwcm9wLCBjb21wdXRlU3R5bGUoZWxlbWVudCwgcHJvcCkpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGtleWZyYW1lcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RHNsTm9kZShcbiAgdmlzaXRvcjogQW5pbWF0aW9uRHNsVmlzaXRvcixcbiAgbm9kZTogQW5pbWF0aW9uTWV0YWRhdGEsXG4gIGNvbnRleHQ6IGFueSxcbik6IGFueTtcbmV4cG9ydCBmdW5jdGlvbiB2aXNpdERzbE5vZGUoXG4gIHZpc2l0b3I6IEFuaW1hdGlvbkFzdFZpc2l0b3IsXG4gIG5vZGU6IEFuaW1hdGlvbkFzdDxBbmltYXRpb25NZXRhZGF0YVR5cGU+LFxuICBjb250ZXh0OiBhbnksXG4pOiBhbnk7XG5leHBvcnQgZnVuY3Rpb24gdmlzaXREc2xOb2RlKHZpc2l0b3I6IGFueSwgbm9kZTogYW55LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlRyaWdnZXI6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFRyaWdnZXIobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhdGU6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFN0YXRlKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlRyYW5zaXRpb246XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFRyYW5zaXRpb24obm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU2VxdWVuY2U6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFNlcXVlbmNlKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkdyb3VwOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRHcm91cChub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRBbmltYXRlKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLktleWZyYW1lczpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0S2V5ZnJhbWVzKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTdHlsZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5SZWZlcmVuY2U6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFJlZmVyZW5jZShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlQ2hpbGQ6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdEFuaW1hdGVDaGlsZChub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlUmVmOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRBbmltYXRlUmVmKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlF1ZXJ5OlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRRdWVyeShub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdGFnZ2VyOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTdGFnZ2VyKG5vZGUsIGNvbnRleHQpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBpbnZhbGlkTm9kZVR5cGUobm9kZS50eXBlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZVN0eWxlKGVsZW1lbnQ6IGFueSwgcHJvcDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuICg8YW55PndpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpKVtwcm9wXTtcbn1cbiJdfQ==