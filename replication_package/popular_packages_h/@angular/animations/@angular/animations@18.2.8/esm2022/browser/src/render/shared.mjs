/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AUTO_STYLE, NoopAnimationPlayer, ɵAnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE, } from '@angular/animations';
import { animationFailed } from '../error_helpers';
import { ANIMATABLE_PROP_SET } from './web_animations/animatable_props_set';
export function optimizeGroupPlayer(players) {
    switch (players.length) {
        case 0:
            return new NoopAnimationPlayer();
        case 1:
            return players[0];
        default:
            return new ɵAnimationGroupPlayer(players);
    }
}
export function normalizeKeyframes(normalizer, keyframes, preStyles = new Map(), postStyles = new Map()) {
    const errors = [];
    const normalizedKeyframes = [];
    let previousOffset = -1;
    let previousKeyframe = null;
    keyframes.forEach((kf) => {
        const offset = kf.get('offset');
        const isSameOffset = offset == previousOffset;
        const normalizedKeyframe = (isSameOffset && previousKeyframe) || new Map();
        kf.forEach((val, prop) => {
            let normalizedProp = prop;
            let normalizedValue = val;
            if (prop !== 'offset') {
                normalizedProp = normalizer.normalizePropertyName(normalizedProp, errors);
                switch (normalizedValue) {
                    case PRE_STYLE:
                        normalizedValue = preStyles.get(prop);
                        break;
                    case AUTO_STYLE:
                        normalizedValue = postStyles.get(prop);
                        break;
                    default:
                        normalizedValue = normalizer.normalizeStyleValue(prop, normalizedProp, normalizedValue, errors);
                        break;
                }
            }
            normalizedKeyframe.set(normalizedProp, normalizedValue);
        });
        if (!isSameOffset) {
            normalizedKeyframes.push(normalizedKeyframe);
        }
        previousKeyframe = normalizedKeyframe;
        previousOffset = offset;
    });
    if (errors.length) {
        throw animationFailed(errors);
    }
    return normalizedKeyframes;
}
export function listenOnPlayer(player, eventName, event, callback) {
    switch (eventName) {
        case 'start':
            player.onStart(() => callback(event && copyAnimationEvent(event, 'start', player)));
            break;
        case 'done':
            player.onDone(() => callback(event && copyAnimationEvent(event, 'done', player)));
            break;
        case 'destroy':
            player.onDestroy(() => callback(event && copyAnimationEvent(event, 'destroy', player)));
            break;
    }
}
export function copyAnimationEvent(e, phaseName, player) {
    const totalTime = player.totalTime;
    const disabled = player.disabled ? true : false;
    const event = makeAnimationEvent(e.element, e.triggerName, e.fromState, e.toState, phaseName || e.phaseName, totalTime == undefined ? e.totalTime : totalTime, disabled);
    const data = e['_data'];
    if (data != null) {
        event['_data'] = data;
    }
    return event;
}
export function makeAnimationEvent(element, triggerName, fromState, toState, phaseName = '', totalTime = 0, disabled) {
    return { element, triggerName, fromState, toState, phaseName, totalTime, disabled: !!disabled };
}
export function getOrSetDefaultValue(map, key, defaultValue) {
    let value = map.get(key);
    if (!value) {
        map.set(key, (value = defaultValue));
    }
    return value;
}
export function parseTimelineCommand(command) {
    const separatorPos = command.indexOf(':');
    const id = command.substring(1, separatorPos);
    const action = command.slice(separatorPos + 1);
    return [id, action];
}
const documentElement = /* @__PURE__ */ (() => typeof document === 'undefined' ? null : document.documentElement)();
export function getParentElement(element) {
    const parent = element.parentNode || element.host || null; // consider host to support shadow DOM
    if (parent === documentElement) {
        return null;
    }
    return parent;
}
function containsVendorPrefix(prop) {
    // Webkit is the only real popular vendor prefix nowadays
    // cc: http://shouldiprefix.com/
    return prop.substring(1, 6) == 'ebkit'; // webkit or Webkit
}
let _CACHED_BODY = null;
let _IS_WEBKIT = false;
export function validateStyleProperty(prop) {
    if (!_CACHED_BODY) {
        _CACHED_BODY = getBodyNode() || {};
        _IS_WEBKIT = _CACHED_BODY.style ? 'WebkitAppearance' in _CACHED_BODY.style : false;
    }
    let result = true;
    if (_CACHED_BODY.style && !containsVendorPrefix(prop)) {
        result = prop in _CACHED_BODY.style;
        if (!result && _IS_WEBKIT) {
            const camelProp = 'Webkit' + prop.charAt(0).toUpperCase() + prop.slice(1);
            result = camelProp in _CACHED_BODY.style;
        }
    }
    return result;
}
export function validateWebAnimatableStyleProperty(prop) {
    return ANIMATABLE_PROP_SET.has(prop);
}
export function getBodyNode() {
    if (typeof document != 'undefined') {
        return document.body;
    }
    return null;
}
export function containsElement(elm1, elm2) {
    while (elm2) {
        if (elm2 === elm1) {
            return true;
        }
        elm2 = getParentElement(elm2);
    }
    return false;
}
export function invokeQuery(element, selector, multi) {
    if (multi) {
        return Array.from(element.querySelectorAll(selector));
    }
    const elem = element.querySelector(selector);
    return elem ? [elem] : [];
}
export function hypenatePropsKeys(original) {
    const newMap = new Map();
    original.forEach((val, prop) => {
        const newProp = prop.replace(/([a-z])([A-Z])/g, '$1-$2');
        newMap.set(newProp, val);
    });
    return newMap;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFHTCxVQUFVLEVBQ1YsbUJBQW1CLEVBQ25CLHFCQUFxQixFQUNyQixVQUFVLElBQUksU0FBUyxHQUV4QixNQUFNLHFCQUFxQixDQUFDO0FBRzdCLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUVqRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUUxRSxNQUFNLFVBQVUsbUJBQW1CLENBQUMsT0FBMEI7SUFDNUQsUUFBUSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsS0FBSyxDQUFDO1lBQ0osT0FBTyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDbkMsS0FBSyxDQUFDO1lBQ0osT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEI7WUFDRSxPQUFPLElBQUkscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUMsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUsa0JBQWtCLENBQ2hDLFVBQW9DLEVBQ3BDLFNBQStCLEVBQy9CLFlBQTJCLElBQUksR0FBRyxFQUFFLEVBQ3BDLGFBQTRCLElBQUksR0FBRyxFQUFFO0lBRXJDLE1BQU0sTUFBTSxHQUFZLEVBQUUsQ0FBQztJQUMzQixNQUFNLG1CQUFtQixHQUF5QixFQUFFLENBQUM7SUFDckQsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDeEIsSUFBSSxnQkFBZ0IsR0FBeUIsSUFBSSxDQUFDO0lBQ2xELFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtRQUN2QixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMs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QUVELE1BQU0sVUFBVSxXQUFXLENBQUMsT0FBWSxFQUFFLFFBQWdCLEVBQUUsS0FBYztJQUN4RSxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ1YsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFDRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUIsQ0FBQztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxRQUF1QjtJQUN2RCxNQUFNLE1BQU0sR0FBa0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUN4QyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO1FBQzdCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDM0IsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtcbiAgQW5pbWF0aW9uRXZlbnQsXG4gIEFuaW1hdGlvblBsYXllcixcbiAgQVVUT19TVFlMRSxcbiAgTm9vcEFuaW1hdGlvblBsYXllcixcbiAgybVBbmltYXRpb25Hcm91cFBsYXllcixcbiAgybVQUkVfU1RZTEUgYXMgUFJFX1NUWUxFLFxuICDJtVN0eWxlRGF0YU1hcCxcbn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyfSBmcm9tICcuLi8uLi9zcmMvZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vYW5pbWF0aW9uX3N0eWxlX25vcm1hbGl6ZXInO1xuaW1wb3J0IHthbmltYXRpb25GYWlsZWR9IGZyb20gJy4uL2Vycm9yX2hlbHBlcnMnO1xuXG5pbXBvcnQge0FOSU1BVEFCTEVfUFJPUF9TRVR9IGZyb20gJy4vd2ViX2FuaW1hdGlvbnMvYW5pbWF0YWJsZV9wcm9wc19zZXQnO1xuXG5leHBvcnQgZnVuY3Rpb24gb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSk6IEFuaW1hdGlvblBsYXllciB7XG4gIHN3aXRjaCAocGxheWVycy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoKTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gcGxheWVyc1swXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG5ldyDJtUFuaW1hdGlvbkdyb3VwUGxheWVyKHBsYXllcnMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVLZXlmcmFtZXMoXG4gIG5vcm1hbGl6ZXI6IEFuaW1hdGlvblN0eWxlTm9ybWFsaXplcixcbiAga2V5ZnJhbWVzOiBBcnJheTzJtVN0eWxlRGF0YU1hcD4sXG4gIHByZVN0eWxlczogybVTdHlsZURhdGFNYXAgPSBuZXcgTWFwKCksXG4gIHBvc3RTdHlsZXM6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpLFxuKTogQXJyYXk8ybVTdHlsZURhdGFNYXA+IHtcbiAgY29uc3QgZXJyb3JzOiBFcnJvcltdID0gW107XG4gIGNvbnN0IG5vcm1hbGl6ZWRLZXlmcmFtZXM6IEFycmF5PMm1U3R5bGVEYXRhTWFwPiA9IFtdO1xuICBsZXQgcHJldmlvdXNPZmZzZXQgPSAtMTtcbiAgbGV0IHByZXZpb3VzS2V5ZnJhbWU6IMm1U3R5bGVEYXRhTWFwIHwgbnVsbCA9IG51bGw7XG4gIGtleWZyYW1lcy5mb3JFYWNoKChrZikgPT4ge1xuICAgIGNvbnN0IG9mZnNldCA9IGtmLmdldCgnb2Zmc2V0JykgYXMgbnVtYmVyO1xuICAgIGNvbnN0IGlzU2FtZU9mZnNldCA9IG9mZnNldCA9PSBwcmV2aW91c09mZnNldDtcbiAgICBjb25zdCBub3JtYWxpemVkS2V5ZnJhbWU6IMm1U3R5bGVEYXRhTWFwID0gKGlzU2FtZU9mZnNldCAmJiBwcmV2aW91c0tleWZyYW1lKSB8fCBuZXcgTWFwKCk7XG4gICAga2YuZm9yRWFjaCgodmFsLCBwcm9wKSA9PiB7XG4gICAgICBsZXQgbm9ybWFsaXplZFByb3AgPSBwcm9wO1xuICAgICAgbGV0IG5vcm1hbGl6ZWRWYWx1ZSA9IHZhbDtcbiAgICAgIGlmIChwcm9wICE9PSAnb2Zmc2V0Jykge1xuICAgICAgICBub3JtYWxpemVkUHJvcCA9IG5vcm1hbGl6ZXIubm9ybWFsaXplUHJvcGVydHlOYW1lKG5vcm1hbGl6ZWRQcm9wLCBlcnJvcnMpO1xuICAgICAgICBzd2l0Y2ggKG5vcm1hbGl6ZWRWYWx1ZSkge1xuICAgICAgICAgIGNhc2UgUFJFX1NUWUxFOlxuICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlID0gcHJlU3R5bGVzLmdldChwcm9wKSE7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgQVVUT19TVFlMRTpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9IHBvc3RTdHlsZXMuZ2V0KHByb3ApITtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9IG5vcm1hbGl6ZXIubm9ybWFsaXplU3R5bGVWYWx1ZShcbiAgICAgICAgICAgICAgcHJvcCxcbiAgICAgICAgICAgICAgbm9ybWFsaXplZFByb3AsXG4gICAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSxcbiAgICAgICAgICAgICAgZXJyb3JzLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBub3JtYWxpemVkS2V5ZnJhbWUuc2V0KG5vcm1hbGl6ZWRQcm9wLCBub3JtYWxpemVkVmFsdWUpO1xuICAgIH0pO1xuICAgIGlmICghaXNTYW1lT2Zmc2V0KSB7XG4gICAgICBub3JtYWxpemVkS2V5ZnJhbWVzLnB1c2gobm9ybWFsaXplZEtleWZyYW1lKTtcbiAgICB9XG4gICAgcHJldmlvdXNLZXlmcmFtZSA9IG5vcm1hbGl6ZWRLZXlmcmFtZTtcbiAgICBwcmV2aW91c09mZnNldCA9IG9mZnNldDtcbiAgfSk7XG4gIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgdGhyb3cgYW5pbWF0aW9uRmFpbGVkKGVycm9ycyk7XG4gIH1cblxuICByZXR1cm4gbm9ybWFsaXplZEtleWZyYW1lcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpc3Rlbk9uUGxheWVyKFxuICBwbGF5ZXI6IEFuaW1hdGlvblBsYXllcixcbiAgZXZlbnROYW1lOiBzdHJpbmcsXG4gIGV2ZW50OiBBbmltYXRpb25FdmVudCB8IHVuZGVmaW5lZCxcbiAgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBhbnksXG4pIHtcbiAgc3dpdGNoIChldmVudE5hbWUpIHtcbiAgICBjYXNlICdzdGFydCc6XG4gICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiBjYWxsYmFjayhldmVudCAmJiBjb3B5QW5pbWF0aW9uRXZlbnQoZXZlbnQsICdzdGFydCcsIHBsYXllcikpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2RvbmUnOlxuICAgICAgcGxheWVyLm9uRG9uZSgoKSA9PiBjYWxsYmFjayhldmVudCAmJiBjb3B5QW5pbWF0aW9uRXZlbnQoZXZlbnQsICdkb25lJywgcGxheWVyKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGVzdHJveSc6XG4gICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IGNhbGxiYWNrKGV2ZW50ICYmIGNvcHlBbmltYXRpb25FdmVudChldmVudCwgJ2Rlc3Ryb3knLCBwbGF5ZXIpKSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weUFuaW1hdGlvbkV2ZW50KFxuICBlOiBBbmltYXRpb25FdmVudCxcbiAgcGhhc2VOYW1lOiBzdHJpbmcsXG4gIHBsYXllcjogQW5pbWF0aW9uUGxheWVyLFxuKTogQW5pbWF0aW9uRXZlbnQge1xuICBjb25zdCB0b3RhbFRpbWUgPSBwbGF5ZXIudG90YWxUaW1lO1xuICBjb25zdCBkaXNhYmxlZCA9IChwbGF5ZXIgYXMgYW55KS5kaXNhYmxlZCA/IHRydWUgOiBmYWxzZTtcbiAgY29uc3QgZXZlbnQgPSBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgZS5lbGVtZW50LFxuICAgIGUudHJpZ2dlck5hbWUsXG4gICAgZS5mcm9tU3RhdGUsXG4gICAgZS50b1N0YXRlLFxuICAgIHBoYXNlTmFtZSB8fCBlLnBoYXNlTmFtZSxcbiAgICB0b3RhbFRpbWUgPT0gdW5kZWZpbmVkID8gZS50b3RhbFRpbWUgOiB0b3RhbFRpbWUsXG4gICAgZGlzYWJsZWQsXG4gICk7XG4gIGNvbnN0IGRhdGEgPSAoZSBhcyBhbnkpWydfZGF0YSddO1xuICBpZiAoZGF0YSAhPSBudWxsKSB7XG4gICAgKGV2ZW50IGFzIGFueSlbJ19kYXRhJ10gPSBkYXRhO1xuICB9XG4gIHJldHVybiBldmVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VBbmltYXRpb25FdmVudChcbiAgZWxlbWVudDogYW55LFxuICB0cmlnZ2VyTmFtZTogc3RyaW5nLFxuICBmcm9tU3RhdGU6IHN0cmluZyxcbiAgdG9TdGF0ZTogc3RyaW5nLFxuICBwaGFzZU5hbWU6IHN0cmluZyA9ICcnLFxuICB0b3RhbFRpbWU6IG51bWJlciA9IDAsXG4gIGRpc2FibGVkPzogYm9vbGVhbixcbik6IEFuaW1hdGlvbkV2ZW50IHtcbiAgcmV0dXJuIHtlbGVtZW50LCB0cmlnZ2VyTmFtZSwgZnJvbVN0YXRlLCB0b1N0YXRlLCBwaGFzZU5hbWUsIHRvdGFsVGltZSwgZGlzYWJsZWQ6ICEhZGlzYWJsZWR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JTZXREZWZhdWx0VmFsdWU8VCwgVj4obWFwOiBNYXA8VCwgVj4sIGtleTogVCwgZGVmYXVsdFZhbHVlOiBWKSB7XG4gIGxldCB2YWx1ZSA9IG1hcC5nZXQoa2V5KTtcbiAgaWYgKCF2YWx1ZSkge1xuICAgIG1hcC5zZXQoa2V5LCAodmFsdWUgPSBkZWZhdWx0VmFsdWUpKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRpbWVsaW5lQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgY29uc3Qgc2VwYXJhdG9yUG9zID0gY29tbWFuZC5pbmRleE9mKCc6Jyk7XG4gIGNvbnN0IGlkID0gY29tbWFuZC5zdWJzdHJpbmcoMSwgc2VwYXJhdG9yUG9zKTtcbiAgY29uc3QgYWN0aW9uID0gY29tbWFuZC5zbGljZShzZXBhcmF0b3JQb3MgKyAxKTtcbiAgcmV0dXJuIFtpZCwgYWN0aW9uXTtcbn1cblxuY29uc3QgZG9jdW1lbnRFbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+XG4gIHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSgpO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFyZW50RWxlbWVudChlbGVtZW50OiBhbnkpOiB1bmtub3duIHwgbnVsbCB7XG4gIGNvbnN0IHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZSB8fCBlbGVtZW50Lmhvc3QgfHwgbnVsbDsgLy8gY29uc2lkZXIgaG9zdCB0byBzdXBwb3J0IHNoYWRvdyBET01cbiAgaWYgKHBhcmVudCA9PT0gZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIHBhcmVudDtcbn1cblxuZnVuY3Rpb24gY29udGFpbnNWZW5kb3JQcmVmaXgocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIC8vIFdlYmtpdCBpcyB0aGUgb25seSByZWFsIHBvcHVsYXIgdmVuZG9yIHByZWZpeCBub3dhZGF5c1xuICAvLyBjYzogaHR0cDovL3Nob3VsZGlwcmVmaXguY29tL1xuICByZXR1cm4gcHJvcC5zdWJzdHJpbmcoMSwgNikgPT0gJ2Via2l0JzsgLy8gd2Via2l0IG9yIFdlYmtpdFxufVxuXG5sZXQgX0NBQ0hFRF9CT0RZOiB7c3R5bGU6IGFueX0gfCBudWxsID0gbnVsbDtcbmxldCBfSVNfV0VCS0lUID0gZmFsc2U7XG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTdHlsZVByb3BlcnR5KHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIV9DQUNIRURfQk9EWSkge1xuICAgIF9DQUNIRURfQk9EWSA9IGdldEJvZHlOb2RlKCkgfHwge307XG4gICAgX0lTX1dFQktJVCA9IF9DQUNIRURfQk9EWSEuc3R5bGUgPyAnV2Via2l0QXBwZWFyYW5jZScgaW4gX0NBQ0hFRF9CT0RZIS5zdHlsZSA6IGZhbHNlO1xuICB9XG5cbiAgbGV0IHJlc3VsdCA9IHRydWU7XG4gIGlmIChfQ0FDSEVEX0JPRFkhLnN0eWxlICYmICFjb250YWluc1ZlbmRvclByZWZpeChwcm9wKSkge1xuICAgIHJlc3VsdCA9IHByb3AgaW4gX0NBQ0hFRF9CT0RZIS5zdHlsZTtcbiAgICBpZiAoIXJlc3VsdCAmJiBfSVNfV0VCS0lUKSB7XG4gICAgICBjb25zdCBjYW1lbFByb3AgPSAnV2Via2l0JyArIHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnNsaWNlKDEpO1xuICAgICAgcmVzdWx0ID0gY2FtZWxQcm9wIGluIF9DQUNIRURfQk9EWSEuc3R5bGU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlV2ViQW5pbWF0YWJsZVN0eWxlUHJvcGVydHkocHJvcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBBTklNQVRBQkxFX1BST1BfU0VULmhhcyhwcm9wKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJvZHlOb2RlKCk6IGFueSB8IG51bGwge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmJvZHk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb250YWluc0VsZW1lbnQoZWxtMTogYW55LCBlbG0yOiBhbnkpOiBib29sZWFuIHtcbiAgd2hpbGUgKGVsbTIpIHtcbiAgICBpZiAoZWxtMiA9PT0gZWxtMSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVsbTIgPSBnZXRQYXJlbnRFbGVtZW50KGVsbTIpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludm9rZVF1ZXJ5KGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pOiBhbnlbXSB7XG4gIGlmIChtdWx0aSkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuICB9XG4gIGNvbnN0IGVsZW0gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICByZXR1cm4gZWxlbSA/IFtlbGVtXSA6IFtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHlwZW5hdGVQcm9wc0tleXMob3JpZ2luYWw6IMm1U3R5bGVEYXRhTWFwKTogybVTdHlsZURhdGFNYXAge1xuICBjb25zdCBuZXdNYXA6IMm1U3R5bGVEYXRhTWFwID0gbmV3IE1hcCgpO1xuICBvcmlnaW5hbC5mb3JFYWNoKCh2YWwsIHByb3ApID0+IHtcbiAgICBjb25zdCBuZXdQcm9wID0gcHJvcC5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKTtcbiAgICBuZXdNYXAuc2V0KG5ld1Byb3AsIHZhbCk7XG4gIH0pO1xuICByZXR1cm4gbmV3TWFwO1xufVxuIl19