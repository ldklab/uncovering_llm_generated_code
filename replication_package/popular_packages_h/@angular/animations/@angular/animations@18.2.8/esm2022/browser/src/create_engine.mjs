/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { NoopAnimationStyleNormalizer } from './dsl/style_normalization/animation_style_normalizer';
import { WebAnimationsStyleNormalizer } from './dsl/style_normalization/web_animations_style_normalizer';
import { NoopAnimationDriver } from './render/animation_driver';
import { AnimationEngine } from './render/animation_engine_next';
import { WebAnimationsDriver } from './render/web_animations/web_animations_driver';
export function createEngine(type, doc) {
    // TODO: find a way to make this tree shakable.
    if (type === 'noop') {
        return new AnimationEngine(doc, new NoopAnimationDriver(), new NoopAnimationStyleNormalizer());
    }
    return new AnimationEngine(doc, new WebAnimationsDriver(), new WebAnimationsStyleNormalizer());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX2VuZ2luZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvY3JlYXRlX2VuZ2luZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxzREFBc0QsQ0FBQztBQUNsRyxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSwyREFBMkQsQ0FBQztBQUN2RyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDL0QsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sK0NBQStDLENBQUM7QUFFbEYsTUFBTSxVQUFVLFlBQVksQ0FBQyxJQUEyQixFQUFFLEdBQWE7SUFDckUsK0NBQStDO0lBQy9DLElBQUksSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO1FBQ3BCLE9BQU8sSUFBSSxlQUFlLENBQUMsR0FBRyxFQUFFLElBQUksbUJBQW1CLEVBQUUsRUFBRSxJQUFJLDRCQUE0QixFQUFFLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRUQsT0FBTyxJQUFJLGVBQWUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxtQkFBbUIsRUFBRSxFQUFFLElBQUksNEJBQTRCLEVBQUUsQ0FBQyxDQUFDO0FBQ2pHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7Tm9vcEFuaW1hdGlvblN0eWxlTm9ybWFsaXplcn0gZnJvbSAnLi9kc2wvc3R5bGVfbm9ybWFsaXphdGlvbi9hbmltYXRpb25fc3R5bGVfbm9ybWFsaXplcic7XG5pbXBvcnQge1dlYkFuaW1hdGlvbnNTdHlsZU5vcm1hbGl6ZXJ9IGZyb20gJy4vZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vd2ViX2FuaW1hdGlvbnNfc3R5bGVfbm9ybWFsaXplcic7XG5pbXBvcnQge05vb3BBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4vcmVuZGVyL2FuaW1hdGlvbl9kcml2ZXInO1xuaW1wb3J0IHtBbmltYXRpb25FbmdpbmV9IGZyb20gJy4vcmVuZGVyL2FuaW1hdGlvbl9lbmdpbmVfbmV4dCc7XG5pbXBvcnQge1dlYkFuaW1hdGlvbnNEcml2ZXJ9IGZyb20gJy4vcmVuZGVyL3dlYl9hbmltYXRpb25zL3dlYl9hbmltYXRpb25zX2RyaXZlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbmdpbmUodHlwZTogJ2FuaW1hdGlvbnMnIHwgJ25vb3AnLCBkb2M6IERvY3VtZW50KTogQW5pbWF0aW9uRW5naW5lIHtcbiAgLy8gVE9ETzogZmluZCBhIHdheSB0byBtYWtlIHRoaXMgdHJlZSBzaGFrYWJsZS5cbiAgaWYgKHR5cGUgPT09ICdub29wJykge1xuICAgIHJldHVybiBuZXcgQW5pbWF0aW9uRW5naW5lKGRvYywgbmV3IE5vb3BBbmltYXRpb25Ecml2ZXIoKSwgbmV3IE5vb3BBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXIoKSk7XG4gIH1cblxuICByZXR1cm4gbmV3IEFuaW1hdGlvbkVuZ2luZShkb2MsIG5ldyBXZWJBbmltYXRpb25zRHJpdmVyKCksIG5ldyBXZWJBbmltYXRpb25zU3R5bGVOb3JtYWxpemVyKCkpO1xufVxuIl19