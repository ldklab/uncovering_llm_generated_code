/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export { computeMsgId } from './digest';
export { I18NHtmlParser } from './i18n_html_parser';
export { MessageBundle } from './message_bundle';
export { Serializer } from './serializers/serializer';
export { Xliff } from './serializers/xliff';
export { Xliff2 } from './serializers/xliff2';
export { Xmb } from './serializers/xmb';
export { Xtb } from './serializers/xtb';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvaTE4bi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNsRCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDL0MsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMxQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDNUMsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3RDLE9BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cbmV4cG9ydCB7Y29tcHV0ZU1zZ0lkfSBmcm9tICcuL2RpZ2VzdCc7XG5leHBvcnQge0kxOE5IdG1sUGFyc2VyfSBmcm9tICcuL2kxOG5faHRtbF9wYXJzZXInO1xuZXhwb3J0IHtNZXNzYWdlQnVuZGxlfSBmcm9tICcuL21lc3NhZ2VfYnVuZGxlJztcbmV4cG9ydCB7U2VyaWFsaXplcn0gZnJvbSAnLi9zZXJpYWxpemVycy9zZXJpYWxpemVyJztcbmV4cG9ydCB7WGxpZmZ9IGZyb20gJy4vc2VyaWFsaXplcnMveGxpZmYnO1xuZXhwb3J0IHtYbGlmZjJ9IGZyb20gJy4vc2VyaWFsaXplcnMveGxpZmYyJztcbmV4cG9ydCB7WG1ifSBmcm9tICcuL3NlcmlhbGl6ZXJzL3htYic7XG5leHBvcnQge1h0Yn0gZnJvbSAnLi9zZXJpYWxpemVycy94dGInO1xuIl19