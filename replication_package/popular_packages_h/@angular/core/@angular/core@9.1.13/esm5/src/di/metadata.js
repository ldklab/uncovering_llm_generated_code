/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { makeParamDecorator } from '../util/decorators';
var ɵ0 = function (token) { return ({ token: token }); };
/**
 * Inject decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export var Inject = makeParamDecorator('Inject', ɵ0);
/**
 * Optional decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export var Optional = makeParamDecorator('Optional');
/**
 * Self decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export var Self = makeParamDecorator('Self');
/**
 * SkipSelf decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export var SkipSelf = makeParamDecorator('SkipSelf');
/**
 * Host decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export var Host = makeParamDecorator('Host');
var ɵ1 = function (attributeName) { return ({ attributeName: attributeName }); };
/**
 * Attribute decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export var Attribute = makeParamDecorator('Attribute', ɵ1);
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9kaS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztTQWdEYyxVQUFDLEtBQVUsSUFBSyxPQUFBLENBQUMsRUFBQyxLQUFLLE9BQUEsRUFBQyxDQUFDLEVBQVQsQ0FBUztBQU43Rjs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxJQUFNLE1BQU0sR0FBb0Isa0JBQWtCLENBQUMsUUFBUSxLQUE0QixDQUFDO0FBc0MvRjs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxJQUFNLFFBQVEsR0FBc0Isa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7QUF3QzFFOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLElBQU0sSUFBSSxHQUFrQixrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQXlDOUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsSUFBTSxRQUFRLEdBQXNCLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBa0MxRTs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxJQUFNLElBQUksR0FBa0Isa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FxRDFCLFVBQUMsYUFBc0IsSUFBSyxPQUFBLENBQUMsRUFBQyxhQUFhLGVBQUEsRUFBQyxDQUFDLEVBQWpCLENBQWlCO0FBUGpGOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLElBQU0sU0FBUyxHQUNsQixrQkFBa0IsQ0FBQyxXQUFXLEtBQWdELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7bWFrZVBhcmFtRGVjb3JhdG9yfSBmcm9tICcuLi91dGlsL2RlY29yYXRvcnMnO1xuXG5cblxuLyoqXG4gKiBUeXBlIG9mIHRoZSBJbmplY3QgZGVjb3JhdG9yIC8gY29uc3RydWN0b3IgZnVuY3Rpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEluamVjdERlY29yYXRvciB7XG4gIC8qKlxuICAgKiBQYXJhbWV0ZXIgZGVjb3JhdG9yIG9uIGEgZGVwZW5kZW5jeSBwYXJhbWV0ZXIgb2YgYSBjbGFzcyBjb25zdHJ1Y3RvclxuICAgKiB0aGF0IHNwZWNpZmllcyBhIGN1c3RvbSBwcm92aWRlciBvZiB0aGUgZGVwZW5kZW5jeS5cbiAgICpcbiAgICogTGVhcm4gbW9yZSBpbiB0aGUgW1wiRGVwZW5kZW5jeSBJbmplY3Rpb24gR3VpZGVcIl0oZ3VpZGUvZGVwZW5kZW5jeS1pbmplY3Rpb24pLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgYSBjbGFzcyBjb25zdHJ1Y3RvciB0aGF0IHNwZWNpZmllcyBhXG4gICAqIGN1c3RvbSBwcm92aWRlciBvZiBhIGRlcGVuZGVuY3kgdXNpbmcgdGhlIHBhcmFtZXRlciBkZWNvcmF0b3IuXG4gICAqXG4gICAqIFdoZW4gYEBJbmplY3QoKWAgaXMgbm90IHByZXNlbnQsIHRoZSBpbmplY3RvciB1c2VzIHRoZSB0eXBlIGFubm90YXRpb24gb2YgdGhlXG4gICAqIHBhcmFtZXRlciBhcyB0aGUgcHJvdmlkZXIuXG4gICAqXG4gICAqIDxjb2RlLWV4YW1wbGUgcGF0aD1cImNvcmUvZGkvdHMvbWV0YWRhdGFfc3BlYy50c1wiIHJlZ2lvbj1cIkluamVjdFdpdGhvdXREZWNvcmF0b3JcIj5cbiAgICogPC9jb2RlLWV4YW1wbGU+XG4gICAqL1xuICAodG9rZW46IGFueSk6IGFueTtcbiAgbmV3KHRva2VuOiBhbnkpOiBJbmplY3Q7XG59XG5cbi8qKlxuICogVHlwZSBvZiB0aGUgSW5qZWN0IG1ldGFkYXRhLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbmplY3Qge1xuICAvKipcbiAgICogQSBbREkgdG9rZW5dKGd1aWRlL2dsb3NzYXJ5I2RpLXRva2VuKSB0aGF0IG1hcHMgdG8gdGhlIGRlcGVuZGVuY3kgdG8gYmUgaW5qZWN0ZWQuXG4gICAqL1xuICB0b2tlbjogYW55O1xufVxuXG4vKipcbiAqIEluamVjdCBkZWNvcmF0b3IgYW5kIG1ldGFkYXRhLlxuICpcbiAqIEBBbm5vdGF0aW9uXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBJbmplY3Q6IEluamVjdERlY29yYXRvciA9IG1ha2VQYXJhbURlY29yYXRvcignSW5qZWN0JywgKHRva2VuOiBhbnkpID0+ICh7dG9rZW59KSk7XG5cblxuLyoqXG4gKiBUeXBlIG9mIHRoZSBPcHRpb25hbCBkZWNvcmF0b3IgLyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9uYWxEZWNvcmF0b3Ige1xuICAvKipcbiAgICogUGFyYW1ldGVyIGRlY29yYXRvciB0byBiZSB1c2VkIG9uIGNvbnN0cnVjdG9yIHBhcmFtZXRlcnMsXG4gICAqIHdoaWNoIG1hcmtzIHRoZSBwYXJhbWV0ZXIgYXMgYmVpbmcgYW4gb3B0aW9uYWwgZGVwZW5kZW5jeS5cbiAgICogVGhlIERJIGZyYW1ld29yayBwcm92aWRlcyBudWxsIGlmIHRoZSBkZXBlbmRlbmN5IGlzIG5vdCBmb3VuZC5cbiAgICpcbiAgICogQ2FuIGJlIHVzZWQgdG9nZXRoZXIgd2l0aCBvdGhlciBwYXJhbWV0ZXIgZGVjb3JhdG9yc1xuICAgKiB0aGF0IG1vZGlmeSBob3cgZGVwZW5kZW5jeSBpbmplY3Rpb24gb3BlcmF0ZXMuXG4gICAqXG4gICAqIExlYXJuIG1vcmUgaW4gdGhlIFtcIkRlcGVuZGVuY3kgSW5qZWN0aW9uIEd1aWRlXCJdKGd1aWRlL2RlcGVuZGVuY3ktaW5qZWN0aW9uKS5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBjb2RlIGFsbG93cyB0aGUgcG9zc2liaWxpdHkgb2YgYSBudWxsIHJlc3VsdDpcbiAgICpcbiAgICogPGNvZGUtZXhhbXBsZSBwYXRoPVwiY29yZS9kaS90cy9tZXRhZGF0YV9zcGVjLnRzXCIgcmVnaW9uPVwiT3B0aW9uYWxcIj5cbiAgICogPC9jb2RlLWV4YW1wbGU+XG4gICAqXG4gICAqL1xuICAoKTogYW55O1xuICBuZXcoKTogT3B0aW9uYWw7XG59XG5cbi8qKlxuICogVHlwZSBvZiB0aGUgT3B0aW9uYWwgbWV0YWRhdGEuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbmFsIHt9XG5cbi8qKlxuICogT3B0aW9uYWwgZGVjb3JhdG9yIGFuZCBtZXRhZGF0YS5cbiAqXG4gKiBAQW5ub3RhdGlvblxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgT3B0aW9uYWw6IE9wdGlvbmFsRGVjb3JhdG9yID0gbWFrZVBhcmFtRGVjb3JhdG9yKCdPcHRpb25hbCcpO1xuXG4vKipcbiAqIFR5cGUgb2YgdGhlIFNlbGYgZGVjb3JhdG9yIC8gY29uc3RydWN0b3IgZnVuY3Rpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlbGZEZWNvcmF0b3Ige1xuICAvKipcbiAgICogUGFyYW1ldGVyIGRlY29yYXRvciB0byBiZSB1c2VkIG9uIGNvbnN0cnVjdG9yIHBhcmFtZXRlcnMsXG4gICAqIHdoaWNoIHRlbGxzIHRoZSBESSBmcmFtZXdvcmsgdG8gc3RhcnQgZGVwZW5kZW5jeSByZXNvbHV0aW9uIGZyb20gdGhlIGxvY2FsIGluamVjdG9yLlxuICAgKlxuICAgKiBSZXNvbHV0aW9uIHdvcmtzIHVwd2FyZCB0aHJvdWdoIHRoZSBpbmplY3RvciBoaWVyYXJjaHksIHNvIHRoZSBjaGlsZHJlblxuICAgKiBvZiB0aGlzIGNsYXNzIG11c3QgY29uZmlndXJlIHRoZWlyIG93biBwcm92aWRlcnMgb3IgYmUgcHJlcGFyZWQgZm9yIGEgbnVsbCByZXN1bHQuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqXG4gICAqIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgdGhlIGRlcGVuZGVuY3kgY2FuIGJlIHJlc29sdmVkXG4gICAqIGJ5IHRoZSBsb2NhbCBpbmplY3RvciB3aGVuIGluc3RhbnRpYXRpbmcgdGhlIGNsYXNzIGl0c2VsZiwgYnV0IG5vdFxuICAgKiB3aGVuIGluc3RhbnRpYXRpbmcgYSBjaGlsZC5cbiAgICpcbiAgICogPGNvZGUtZXhhbXBsZSBwYXRoPVwiY29yZS9kaS90cy9tZXRhZGF0YV9zcGVjLnRzXCIgcmVnaW9uPVwiU2VsZlwiPlxuICAgKiA8L2NvZGUtZXhhbXBsZT5cbiAgICpcbiAgICpcbiAgICogQHNlZSBgU2tpcFNlbGZgXG4gICAqIEBzZWUgYE9wdGlvbmFsYFxuICAgKlxuICAgKi9cbiAgKCk6IGFueTtcbiAgbmV3KCk6IFNlbGY7XG59XG5cbi8qKlxuICogVHlwZSBvZiB0aGUgU2VsZiBtZXRhZGF0YS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2VsZiB7fVxuXG4vKipcbiAqIFNlbGYgZGVjb3JhdG9yIGFuZCBtZXRhZGF0YS5cbiAqXG4gKiBAQW5ub3RhdGlvblxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgU2VsZjogU2VsZkRlY29yYXRvciA9IG1ha2VQYXJhbURlY29yYXRvcignU2VsZicpO1xuXG5cbi8qKlxuICogVHlwZSBvZiB0aGUgU2tpcFNlbGYgZGVjb3JhdG9yIC8gY29uc3RydWN0b3IgZnVuY3Rpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNraXBTZWxmRGVjb3JhdG9yIHtcbiAgLyoqXG4gICAqIFBhcmFtZXRlciBkZWNvcmF0b3IgdG8gYmUgdXNlZCBvbiBjb25zdHJ1Y3RvciBwYXJhbWV0ZXJzLFxuICAgKiB3aGljaCB0ZWxscyB0aGUgREkgZnJhbWV3b3JrIHRvIHN0YXJ0IGRlcGVuZGVuY3kgcmVzb2x1dGlvbiBmcm9tIHRoZSBwYXJlbnQgaW5qZWN0b3IuXG4gICAqIFJlc29sdXRpb24gd29ya3MgdXB3YXJkIHRocm91Z2ggdGhlIGluamVjdG9yIGhpZXJhcmNoeSwgc28gdGhlIGxvY2FsIGluamVjdG9yXG4gICAqIGlzIG5vdCBjaGVja2VkIGZvciBhIHByb3ZpZGVyLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiBJbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUsIHRoZSBkZXBlbmRlbmN5IGNhbiBiZSByZXNvbHZlZCB3aGVuXG4gICAqIGluc3RhbnRpYXRpbmcgYSBjaGlsZCwgYnV0IG5vdCB3aGVuIGluc3RhbnRpYXRpbmcgdGhlIGNsYXNzIGl0c2VsZi5cbiAgICpcbiAgICogPGNvZGUtZXhhbXBsZSBwYXRoPVwiY29yZS9kaS90cy9tZXRhZGF0YV9zcGVjLnRzXCIgcmVnaW9uPVwiU2tpcFNlbGZcIj5cbiAgICogPC9jb2RlLWV4YW1wbGU+XG4gICAqXG4gICAqIExlYXJuIG1vcmUgaW4gdGhlXG4gICAqIFtEZXBlbmRlbmN5IEluamVjdGlvbiBndWlkZV0oZ3VpZGUvZGVwZW5kZW5jeS1pbmplY3Rpb24taW4tYWN0aW9uI3NraXApLlxuICAgKlxuICAgKiBAc2VlIGBTZWxmYFxuICAgKiBAc2VlIGBPcHRpb25hbGBcbiAgICpcbiAgICovXG4gICgpOiBhbnk7XG4gIG5ldygpOiBTa2lwU2VsZjtcbn1cblxuLyoqXG4gKiBUeXBlIG9mIHRoZSBTa2lwU2VsZiBtZXRhZGF0YS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2tpcFNlbGYge31cblxuLyoqXG4gKiBTa2lwU2VsZiBkZWNvcmF0b3IgYW5kIG1ldGFkYXRhLlxuICpcbiAqIEBBbm5vdGF0aW9uXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBTa2lwU2VsZjogU2tpcFNlbGZEZWNvcmF0b3IgPSBtYWtlUGFyYW1EZWNvcmF0b3IoJ1NraXBTZWxmJyk7XG5cbi8qKlxuICogVHlwZSBvZiB0aGUgSG9zdCBkZWNvcmF0b3IgLyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdERlY29yYXRvciB7XG4gIC8qKlxuICAgKiBQYXJhbWV0ZXIgZGVjb3JhdG9yIG9uIGEgdmlldy1wcm92aWRlciBwYXJhbWV0ZXIgb2YgYSBjbGFzcyBjb25zdHJ1Y3RvclxuICAgKiB0aGF0IHRlbGxzIHRoZSBESSBmcmFtZXdvcmsgdG8gcmVzb2x2ZSB0aGUgdmlldyBieSBjaGVja2luZyBpbmplY3RvcnMgb2YgY2hpbGRcbiAgICogZWxlbWVudHMsIGFuZCBzdG9wIHdoZW4gcmVhY2hpbmcgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGUgY3VycmVudCBjb21wb25lbnQuXG4gICAqXG4gICAqIEZvciBhbiBleHRlbmRlZCBleGFtcGxlLCBzZWVcbiAgICogW1wiRGVwZW5kZW5jeSBJbmplY3Rpb24gR3VpZGVcIl0oZ3VpZGUvZGVwZW5kZW5jeS1pbmplY3Rpb24taW4tYWN0aW9uI29wdGlvbmFsKS5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBzaG93cyB1c2Ugd2l0aCB0aGUgYEBPcHRpb25hbGAgZGVjb3JhdG9yLCBhbmQgYWxsb3dzIGZvciBhIG51bGwgcmVzdWx0LlxuICAgKlxuICAgKiA8Y29kZS1leGFtcGxlIHBhdGg9XCJjb3JlL2RpL3RzL21ldGFkYXRhX3NwZWMudHNcIiByZWdpb249XCJIb3N0XCI+XG4gICAqIDwvY29kZS1leGFtcGxlPlxuICAgKi9cbiAgKCk6IGFueTtcbiAgbmV3KCk6IEhvc3Q7XG59XG5cbi8qKlxuICogVHlwZSBvZiB0aGUgSG9zdCBtZXRhZGF0YS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdCB7fVxuXG4vKipcbiAqIEhvc3QgZGVjb3JhdG9yIGFuZCBtZXRhZGF0YS5cbiAqXG4gKiBAQW5ub3RhdGlvblxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgSG9zdDogSG9zdERlY29yYXRvciA9IG1ha2VQYXJhbURlY29yYXRvcignSG9zdCcpO1xuXG5cbi8qKlxuICogVHlwZSBvZiB0aGUgQXR0cmlidXRlIGRlY29yYXRvciAvIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBdHRyaWJ1dGVEZWNvcmF0b3Ige1xuICAvKipcbiAgICogUGFyYW1ldGVyIGRlY29yYXRvciBmb3IgYSBkaXJlY3RpdmUgY29uc3RydWN0b3IgdGhhdCBkZXNpZ25hdGVzXG4gICAqIGEgaG9zdC1lbGVtZW50IGF0dHJpYnV0ZSB3aG9zZSB2YWx1ZSBpcyBpbmplY3RlZCBhcyBhIGNvbnN0YW50IHN0cmluZyBsaXRlcmFsLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKlxuICAgKiBTdXBwb3NlIHdlIGhhdmUgYW4gYDxpbnB1dD5gIGVsZW1lbnQgYW5kIHdhbnQgdG8ga25vdyBpdHMgYHR5cGVgLlxuICAgKlxuICAgKiBgYGBodG1sXG4gICAqIDxpbnB1dCB0eXBlPVwidGV4dFwiPlxuICAgKiBgYGBcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIHVzZXMgdGhlIGRlY29yYXRvciB0byBpbmplY3QgdGhlIHN0cmluZyBsaXRlcmFsIGB0ZXh0YC5cbiAgICpcbiAgICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdhdHRyaWJ1dGVNZXRhZGF0YSd9XG4gICAqXG4gICAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gICAqXG4gICAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0nYXR0cmlidXRlRmFjdG9yeSd9XG4gICAqXG4gICAqL1xuICAobmFtZTogc3RyaW5nKTogYW55O1xuICBuZXcobmFtZTogc3RyaW5nKTogQXR0cmlidXRlO1xufVxuXG4vKipcbiAqIFR5cGUgb2YgdGhlIEF0dHJpYnV0ZSBtZXRhZGF0YS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlIHtcbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgd2hvc2UgdmFsdWUgY2FuIGJlIGluamVjdGVkLlxuICAgKi9cbiAgYXR0cmlidXRlTmFtZT86IHN0cmluZztcbn1cblxuLyoqXG4gKiBBdHRyaWJ1dGUgZGVjb3JhdG9yIGFuZCBtZXRhZGF0YS5cbiAqXG4gKiBAQW5ub3RhdGlvblxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgQXR0cmlidXRlOiBBdHRyaWJ1dGVEZWNvcmF0b3IgPVxuICAgIG1ha2VQYXJhbURlY29yYXRvcignQXR0cmlidXRlJywgKGF0dHJpYnV0ZU5hbWU/OiBzdHJpbmcpID0+ICh7YXR0cmlidXRlTmFtZX0pKTtcbiJdfQ==