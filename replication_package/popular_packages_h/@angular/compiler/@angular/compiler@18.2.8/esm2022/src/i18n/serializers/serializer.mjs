/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as i18n from '../i18n_ast';
export class Serializer {
    // Creates a name mapper, see `PlaceholderMapper`
    // Returning `null` means that no name mapping is used.
    createNameMapper(message) {
        return null;
    }
}
/**
 * A simple mapper that take a function to transform an internal name to a public name
 */
export class SimplePlaceholderMapper extends i18n.RecurseVisitor {
    // create a mapping from the message
    constructor(message, mapName) {
        super();
        this.mapName = mapName;
        this.internalToPublic = {};
        this.publicToNextId = {};
        this.publicToInternal = {};
        message.nodes.forEach((node) => node.visit(this));
    }
    toPublicName(internalName) {
        return this.internalToPublic.hasOwnProperty(internalName)
            ? this.internalToPublic[internalName]
            : null;
    }
    toInternalName(publicName) {
        return this.publicToInternal.hasOwnProperty(publicName)
            ? this.publicToInternal[publicName]
            : null;
    }
    visitText(text, context) {
        return null;
    }
    visitTagPlaceholder(ph, context) {
        this.visitPlaceholderName(ph.startName);
        super.visitTagPlaceholder(ph, context);
        this.visitPlaceholderName(ph.closeName);
    }
    visitPlaceholder(ph, context) {
        this.visitPlaceholderName(ph.name);
    }
    visitBlockPlaceholder(ph, context) {
        this.visitPlaceholderName(ph.startName);
        super.visitBlockPlaceholder(ph, context);
        this.visitPlaceholderName(ph.closeName);
    }
    visitIcuPlaceholder(ph, context) {
        this.visitPlaceholderName(ph.name);
    }
    // XMB placeholders could only contains A-Z, 0-9 and _
    visitPlaceholderName(internalName) {
        if (!internalName || this.internalToPublic.hasOwnProperty(internalName)) {
            return;
        }
        let publicName = this.mapName(internalName);
        if (this.publicToInternal.hasOwnProperty(publicName)) {
            // Create a new XMB when it has already been used
            const nextId = this.publicToNextId[publicName];
            this.publicToNextId[publicName] = nextId + 1;
            publicName = `${publicName}_${nextId}`;
        }
        else {
            this.publicToNextId[publicName] = 1;
        }
        this.internalToPublic[internalName] = publicName;
        this.publicToInternal[publicName] = internalName;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9pMThuL3NlcmlhbGl6ZXJzL3NlcmlhbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLElBQUksTUFBTSxhQUFhLENBQUM7QUFFcEMsTUFBTSxPQUFnQixVQUFVO0lBYTlCLGlEQUFpRDtJQUNqRCx1REFBdUQ7SUFDdkQsZ0JBQWdCLENBQUMsT0FBcUI7UUFDcEMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUFjRDs7R0FFRztBQUNILE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxJQUFJLENBQUMsY0FBYztJQUs5RCxvQ0FBb0M7SUFDcEMsWUFDRSxPQUFxQixFQUNiLE9BQWlDO1FBRXpDLEtBQUssRUFBRSxDQUFDO1FBRkEsWUFBTyxHQUFQLE9BQU8sQ0FBMEI7UUFQbkMscUJBQWdCLEdBQTBCLEVBQUUsQ0FBQztRQUM3QyxtQkFBYyxHQUEwQixFQUFFLENBQUM7UUFDM0MscUJBQWdCLEdBQTBCLEVBQUUsQ0FBQztRQVFuRCxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxZQUFZLENBQUMsWUFBb0I7UUFDL0IsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQztZQUN2RCxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQztZQUNyQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ1gsQ0FBQztJQUVELGNBQWMsQ0FBQyxVQUFrQjtRQUMvQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDO1lBQ3JELENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDO1lBQ25DLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDWCxDQUFDO0lBRVEsU0FBUyxDQUFDLElBQWUsRUFBRSxPQUFhO1FBQy9DLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVRLG1CQUFtQixDQUFDLEVBQXVCLEVBQUUsT0FBYTtRQUNqRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRVEsZ0JBQWdCLENBQUMsRUFBb0IsRUFBRSxPQUFhO1FBQzNELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVRLHFCQUFxQixDQUFDLEVBQXlCLEVBQUUsT0FBYTtRQUNyRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRVEsbUJBQW1CLENBQUMsRUFBdUIsRUFBRSxPQUFhO1FBQ2pFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELHNEQUFzRDtJQUM5QyxvQkFBb0IsQ0FBQyxZQUFvQjtRQUMvQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUN4RSxPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFNUMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDckQsaURBQWlEO1lBQ2pELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQzdDLFVBQVUsR0FBRyxHQUFHLFVBQVUsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUN6QyxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEdBQUcsVUFBVSxDQUFDO1FBQ2pELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxZQUFZLENBQUM7SUFDbkQsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uL2kxOG5fYXN0JztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNlcmlhbGl6ZXIge1xuICAvLyAtIFRoZSBgcGxhY2Vob2xkZXJzYCBhbmQgYHBsYWNlaG9sZGVyVG9NZXNzYWdlYCBwcm9wZXJ0aWVzIGFyZSBpcnJlbGV2YW50IGluIHRoZSBpbnB1dCBtZXNzYWdlc1xuICAvLyAtIFRoZSBgaWRgIGNvbnRhaW5zIHRoZSBtZXNzYWdlIGlkIHRoYXQgdGhlIHNlcmlhbGl6ZXIgaXMgZXhwZWN0ZWQgdG8gdXNlXG4gIC8vIC0gUGxhY2Vob2xkZXIgbmFtZXMgYXJlIGFscmVhZHkgbWFwIHRvIHB1YmxpYyBuYW1lcyB1c2luZyB0aGUgcHJvdmlkZWQgbWFwcGVyXG4gIGFic3RyYWN0IHdyaXRlKG1lc3NhZ2VzOiBpMThuLk1lc3NhZ2VbXSwgbG9jYWxlOiBzdHJpbmcgfCBudWxsKTogc3RyaW5nO1xuXG4gIGFic3RyYWN0IGxvYWQoXG4gICAgY29udGVudDogc3RyaW5nLFxuICAgIHVybDogc3RyaW5nLFxuICApOiB7bG9jYWxlOiBzdHJpbmcgfCBudWxsOyBpMThuTm9kZXNCeU1zZ0lkOiB7W21zZ0lkOiBzdHJpbmddOiBpMThuLk5vZGVbXX19O1xuXG4gIGFic3RyYWN0IGRpZ2VzdChtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOiBzdHJpbmc7XG5cbiAgLy8gQ3JlYXRlcyBhIG5hbWUgbWFwcGVyLCBzZWUgYFBsYWNlaG9sZGVyTWFwcGVyYFxuICAvLyBSZXR1cm5pbmcgYG51bGxgIG1lYW5zIHRoYXQgbm8gbmFtZSBtYXBwaW5nIGlzIHVzZWQuXG4gIGNyZWF0ZU5hbWVNYXBwZXIobWVzc2FnZTogaTE4bi5NZXNzYWdlKTogUGxhY2Vob2xkZXJNYXBwZXIgfCBudWxsIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIEEgYFBsYWNlaG9sZGVyTWFwcGVyYCBjb252ZXJ0cyBwbGFjZWhvbGRlciBuYW1lcyBmcm9tIGludGVybmFsIHRvIHNlcmlhbGl6ZWQgcmVwcmVzZW50YXRpb24gYW5kXG4gKiBiYWNrLlxuICpcbiAqIEl0IHNob3VsZCBiZSB1c2VkIGZvciBzZXJpYWxpemF0aW9uIGZvcm1hdCB0aGF0IHB1dCBjb25zdHJhaW50cyBvbiB0aGUgcGxhY2Vob2xkZXIgbmFtZXMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGxhY2Vob2xkZXJNYXBwZXIge1xuICB0b1B1YmxpY05hbWUoaW50ZXJuYWxOYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsO1xuXG4gIHRvSW50ZXJuYWxOYW1lKHB1YmxpY05hbWU6IHN0cmluZyk6IHN0cmluZyB8IG51bGw7XG59XG5cbi8qKlxuICogQSBzaW1wbGUgbWFwcGVyIHRoYXQgdGFrZSBhIGZ1bmN0aW9uIHRvIHRyYW5zZm9ybSBhbiBpbnRlcm5hbCBuYW1lIHRvIGEgcHVibGljIG5hbWVcbiAqL1xuZXhwb3J0IGNsYXNzIFNpbXBsZVBsYWNlaG9sZGVyTWFwcGVyIGV4dGVuZHMgaTE4bi5SZWN1cnNlVmlzaXRvciBpbXBsZW1lbnRzIFBsYWNlaG9sZGVyTWFwcGVyIHtcbiAgcHJpdmF0ZSBpbnRlcm5hbFRvUHVibGljOiB7W2s6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgcHJpdmF0ZSBwdWJsaWNUb05leHRJZDoge1trOiBzdHJpbmddOiBudW1iZXJ9ID0ge307XG4gIHByaXZhdGUgcHVibGljVG9JbnRlcm5hbDoge1trOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG5cbiAgLy8gY3JlYXRlIGEgbWFwcGluZyBmcm9tIHRoZSBtZXNzYWdlXG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSxcbiAgICBwcml2YXRlIG1hcE5hbWU6IChuYW1lOiBzdHJpbmcpID0+IHN0cmluZyxcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgICBtZXNzYWdlLm5vZGVzLmZvckVhY2goKG5vZGUpID0+IG5vZGUudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdG9QdWJsaWNOYW1lKGludGVybmFsTmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxUb1B1YmxpYy5oYXNPd25Qcm9wZXJ0eShpbnRlcm5hbE5hbWUpXG4gICAgICA/IHRoaXMuaW50ZXJuYWxUb1B1YmxpY1tpbnRlcm5hbE5hbWVdXG4gICAgICA6IG51bGw7XG4gIH1cblxuICB0b0ludGVybmFsTmFtZShwdWJsaWNOYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5wdWJsaWNUb0ludGVybmFsLmhhc093blByb3BlcnR5KHB1YmxpY05hbWUpXG4gICAgICA/IHRoaXMucHVibGljVG9JbnRlcm5hbFtwdWJsaWNOYW1lXVxuICAgICAgOiBudWxsO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRUZXh0KHRleHQ6IGkxOG4uVGV4dCwgY29udGV4dD86IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdFRhZ1BsYWNlaG9sZGVyKHBoOiBpMThuLlRhZ1BsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0UGxhY2Vob2xkZXJOYW1lKHBoLnN0YXJ0TmFtZSk7XG4gICAgc3VwZXIudmlzaXRUYWdQbGFjZWhvbGRlcihwaCwgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdFBsYWNlaG9sZGVyTmFtZShwaC5jbG9zZU5hbWUpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRQbGFjZWhvbGRlcihwaDogaTE4bi5QbGFjZWhvbGRlciwgY29udGV4dD86IGFueSk6IGFueSB7XG4gICAgdGhpcy52aXNpdFBsYWNlaG9sZGVyTmFtZShwaC5uYW1lKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0QmxvY2tQbGFjZWhvbGRlcihwaDogaTE4bi5CbG9ja1BsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0UGxhY2Vob2xkZXJOYW1lKHBoLnN0YXJ0TmFtZSk7XG4gICAgc3VwZXIudmlzaXRCbG9ja1BsYWNlaG9sZGVyKHBoLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0UGxhY2Vob2xkZXJOYW1lKHBoLmNsb3NlTmFtZSk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEljdVBsYWNlaG9sZGVyKHBoOiBpMThuLkljdVBsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0UGxhY2Vob2xkZXJOYW1lKHBoLm5hbWUpO1xuICB9XG5cbiAgLy8gWE1CIHBsYWNlaG9sZGVycyBjb3VsZCBvbmx5IGNvbnRhaW5zIEEtWiwgMC05IGFuZCBfXG4gIHByaXZhdGUgdmlzaXRQbGFjZWhvbGRlck5hbWUoaW50ZXJuYWxOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIWludGVybmFsTmFtZSB8fCB0aGlzLmludGVybmFsVG9QdWJsaWMuaGFzT3duUHJvcGVydHkoaW50ZXJuYWxOYW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwdWJsaWNOYW1lID0gdGhpcy5tYXBOYW1lKGludGVybmFsTmFtZSk7XG5cbiAgICBpZiAodGhpcy5wdWJsaWNUb0ludGVybmFsLmhhc093blByb3BlcnR5KHB1YmxpY05hbWUpKSB7XG4gICAgICAvLyBDcmVhdGUgYSBuZXcgWE1CIHdoZW4gaXQgaGFzIGFscmVhZHkgYmVlbiB1c2VkXG4gICAgICBjb25zdCBuZXh0SWQgPSB0aGlzLnB1YmxpY1RvTmV4dElkW3B1YmxpY05hbWVdO1xuICAgICAgdGhpcy5wdWJsaWNUb05leHRJZFtwdWJsaWNOYW1lXSA9IG5leHRJZCArIDE7XG4gICAgICBwdWJsaWNOYW1lID0gYCR7cHVibGljTmFtZX1fJHtuZXh0SWR9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wdWJsaWNUb05leHRJZFtwdWJsaWNOYW1lXSA9IDE7XG4gICAgfVxuXG4gICAgdGhpcy5pbnRlcm5hbFRvUHVibGljW2ludGVybmFsTmFtZV0gPSBwdWJsaWNOYW1lO1xuICAgIHRoaXMucHVibGljVG9JbnRlcm5hbFtwdWJsaWNOYW1lXSA9IGludGVybmFsTmFtZTtcbiAgfVxufVxuIl19