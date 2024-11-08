/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export class Tree {
    constructor(root) {
        this._root = root;
    }
    get root() {
        return this._root.value;
    }
    /**
     * @internal
     */
    parent(t) {
        const p = this.pathFromRoot(t);
        return p.length > 1 ? p[p.length - 2] : null;
    }
    /**
     * @internal
     */
    children(t) {
        const n = findNode(t, this._root);
        return n ? n.children.map((t) => t.value) : [];
    }
    /**
     * @internal
     */
    firstChild(t) {
        const n = findNode(t, this._root);
        return n && n.children.length > 0 ? n.children[0].value : null;
    }
    /**
     * @internal
     */
    siblings(t) {
        const p = findPath(t, this._root);
        if (p.length < 2)
            return [];
        const c = p[p.length - 2].children.map((c) => c.value);
        return c.filter((cc) => cc !== t);
    }
    /**
     * @internal
     */
    pathFromRoot(t) {
        return findPath(t, this._root).map((s) => s.value);
    }
}
// DFS for the node matching the value
function findNode(value, node) {
    if (value === node.value)
        return node;
    for (const child of node.children) {
        const node = findNode(value, child);
        if (node)
            return node;
    }
    return null;
}
// Return the path to the node with the given value using DFS
function findPath(value, node) {
    if (value === node.value)
        return [node];
    for (const child of node.children) {
        const path = findPath(value, child);
        if (path.length) {
            path.unshift(node);
            return path;
        }
    }
    return [];
}
export class TreeNode {
    constructor(value, children) {
        this.value = value;
        this.children = children;
    }
    toString() {
        return `TreeNode(${this.value})`;
    }
}
// Return the list of T indexed by outlet name
export function nodeChildrenAsMap(node) {
    const map = {};
    if (node) {
        node.children.forEach((child) => (map[child.value.outlet] = child));
    }
    return map;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvdXRpbHMvdHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxNQUFNLE9BQU8sSUFBSTtJQUlmLFlBQVksSUFBaUI7UUFDM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTSxDQUFDLENBQUk7UUFDVCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDL0MsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUSxDQUFDLENBQUk7UUFDWCxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ2pELENBQUM7SUFFRDs7T0FFRztJQUNILFVBQVUsQ0FBQyxDQUFJO1FBQ2IsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcs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b29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuZXhwb3J0IGNsYXNzIFRyZWU8VD4ge1xuICAvKiogQGludGVybmFsICovXG4gIF9yb290OiBUcmVlTm9kZTxUPjtcblxuICBjb25zdHJ1Y3Rvcihyb290OiBUcmVlTm9kZTxUPikge1xuICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICB9XG5cbiAgZ2V0IHJvb3QoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX3Jvb3QudmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBwYXJlbnQodDogVCk6IFQgfCBudWxsIHtcbiAgICBjb25zdCBwID0gdGhpcy5wYXRoRnJvbVJvb3QodCk7XG4gICAgcmV0dXJuIHAubGVuZ3RoID4gMSA/IHBbcC5sZW5ndGggLSAyXSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBjaGlsZHJlbih0OiBUKTogVFtdIHtcbiAgICBjb25zdCBuID0gZmluZE5vZGUodCwgdGhpcy5fcm9vdCk7XG4gICAgcmV0dXJuIG4gPyBuLmNoaWxkcmVuLm1hcCgodCkgPT4gdC52YWx1ZSkgOiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGZpcnN0Q2hpbGQodDogVCk6IFQgfCBudWxsIHtcbiAgICBjb25zdCBuID0gZmluZE5vZGUodCwgdGhpcy5fcm9vdCk7XG4gICAgcmV0dXJuIG4gJiYgbi5jaGlsZHJlbi5sZW5ndGggPiAwID8gbi5jaGlsZHJlblswXS52YWx1ZSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBzaWJsaW5ncyh0OiBUKTogVFtdIHtcbiAgICBjb25zdCBwID0gZmluZFBhdGgodCwgdGhpcy5fcm9vdCk7XG4gICAgaWYgKHAubGVuZ3RoIDwgMikgcmV0dXJuIFtdO1xuXG4gICAgY29uc3QgYyA9IHBbcC5sZW5ndGggLSAyXS5jaGlsZHJlbi5tYXAoKGMpID0+IGMudmFsdWUpO1xuICAgIHJldHVybiBjLmZpbHRlcigoY2MpID0+IGNjICE9PSB0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHBhdGhGcm9tUm9vdCh0OiBUKTogVFtdIHtcbiAgICByZXR1cm4gZmluZFBhdGgodCwgdGhpcy5fcm9vdCkubWFwKChzKSA9PiBzLnZhbHVlKTtcbiAgfVxufVxuXG4vLyBERlMgZm9yIHRoZSBub2RlIG1hdGNoaW5nIHRoZSB2YWx1ZVxuZnVuY3Rpb24gZmluZE5vZGU8VD4odmFsdWU6IFQsIG5vZGU6IFRyZWVOb2RlPFQ+KTogVHJlZU5vZGU8VD4gfCBudWxsIHtcbiAgaWYgKHZhbHVlID09PSBub2RlLnZhbHVlKSByZXR1cm4gbm9kZTtcblxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICBjb25zdCBub2RlID0gZmluZE5vZGUodmFsdWUsIGNoaWxkKTtcbiAgICBpZiAobm9kZSkgcmV0dXJuIG5vZGU7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gUmV0dXJuIHRoZSBwYXRoIHRvIHRoZSBub2RlIHdpdGggdGhlIGdpdmVuIHZhbHVlIHVzaW5nIERGU1xuZnVuY3Rpb24gZmluZFBhdGg8VD4odmFsdWU6IFQsIG5vZGU6IFRyZWVOb2RlPFQ+KTogVHJlZU5vZGU8VD5bXSB7XG4gIGlmICh2YWx1ZSA9PT0gbm9kZS52YWx1ZSkgcmV0dXJuIFtub2RlXTtcblxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICBjb25zdCBwYXRoID0gZmluZFBhdGgodmFsdWUsIGNoaWxkKTtcbiAgICBpZiAocGF0aC5sZW5ndGgpIHtcbiAgICAgIHBhdGgudW5zaGlmdChub2RlKTtcbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbXTtcbn1cblxuZXhwb3J0IGNsYXNzIFRyZWVOb2RlPFQ+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHZhbHVlOiBULFxuICAgIHB1YmxpYyBjaGlsZHJlbjogVHJlZU5vZGU8VD5bXSxcbiAgKSB7fVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBUcmVlTm9kZSgke3RoaXMudmFsdWV9KWA7XG4gIH1cbn1cblxuLy8gUmV0dXJuIHRoZSBsaXN0IG9mIFQgaW5kZXhlZCBieSBvdXRsZXQgbmFtZVxuZXhwb3J0IGZ1bmN0aW9uIG5vZGVDaGlsZHJlbkFzTWFwPFQgZXh0ZW5kcyB7b3V0bGV0OiBzdHJpbmd9Pihub2RlOiBUcmVlTm9kZTxUPiB8IG51bGwpIHtcbiAgY29uc3QgbWFwOiB7W291dGxldDogc3RyaW5nXTogVHJlZU5vZGU8VD59ID0ge307XG5cbiAgaWYgKG5vZGUpIHtcbiAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiAobWFwW2NoaWxkLnZhbHVlLm91dGxldF0gPSBjaGlsZCkpO1xuICB9XG5cbiAgcmV0dXJuIG1hcDtcbn1cbiJdfQ==