import * as o from '../../../output/output_ast';
import { ParseSourceSpan } from '../../../parse_util';
import { serializeIcuNode } from './icu_serializer';
import { formatI18nPlaceholderName } from './util';
export function createLocalizeStatements(variable, message, params) {
    const { messageParts, placeHolders } = serializeI18nMessageForLocalize(message);
    const sourceSpan = getSourceSpan(message);
    const expressions = placeHolders.map((ph) => params[ph.text]);
    const localizedString = o.localizedString(message, messageParts, placeHolders, expressions, sourceSpan);
    const variableInitialization = variable.set(localizedString);
    return [new o.ExpressionStatement(variableInitialization)];
}
/**
 * This visitor walks over an i18n tree, capturing literal strings and placeholders.
 *
 * The result can be used for generating the `$localize` tagged template literals.
 */
class LocalizeSerializerVisitor {
    constructor(placeholderToMessage, pieces) {
        this.placeholderToMessage = placeholderToMessage;
        this.pieces = pieces;
    }
    visitText(text) {
        if (this.pieces[this.pieces.length - 1] instanceof o.LiteralPiece) {
            // Two literal pieces in a row means that there was some comment node in-between.
            this.pieces[this.pieces.length - 1].text += text.value;
        }
        else {
            const sourceSpan = new ParseSourceSpan(text.sourceSpan.fullStart, text.sourceSpan.end, text.sourceSpan.fullStart, text.sourceSpan.details);
            this.pieces.push(new o.LiteralPiece(text.value, sourceSpan));
        }
    }
    visitContainer(container) {
        container.children.forEach((child) => child.visit(this));
    }
    visitIcu(icu) {
        this.pieces.push(new o.LiteralPiece(serializeIcuNode(icu), icu.sourceSpan));
    }
    visitTagPlaceholder(ph) {
        this.pieces.push(this.createPlaceholderPiece(ph.startName, ph.startSourceSpan ?? ph.sourceSpan));
        if (!ph.isVoid) {
            ph.children.forEach((child) => child.visit(this));
            this.pieces.push(this.createPlaceholderPiece(ph.closeName, ph.endSourceSpan ?? ph.sourceSpan));
        }
    }
    visitPlaceholder(ph) {
        this.pieces.push(this.createPlaceholderPiece(ph.name, ph.sourceSpan));
    }
    visitBlockPlaceholder(ph) {
        this.pieces.push(this.createPlaceholderPiece(ph.startName, ph.startSourceSpan ?? ph.sourceSpan));
        ph.children.forEach((child) => child.visit(this));
        this.pieces.push(this.createPlaceholderPiece(ph.closeName, ph.endSourceSpan ?? ph.sourceSpan));
    }
    visitIcuPlaceholder(ph) {
        this.pieces.push(this.createPlaceholderPiece(ph.name, ph.sourceSpan, this.placeholderToMessage[ph.name]));
    }
    createPlaceholderPiece(name, sourceSpan, associatedMessage) {
        return new o.PlaceholderPiece(formatI18nPlaceholderName(name, /* useCamelCase */ false), sourceSpan, associatedMessage);
    }
}
/**
 * Serialize an i18n message into two arrays: messageParts and placeholders.
 *
 * These arrays will be used to generate `$localize` tagged template literals.
 *
 * @param message The message to be serialized.
 * @returns an object containing the messageParts and placeholders.
 */
export function serializeI18nMessageForLocalize(message) {
    const pieces = [];
    const serializerVisitor = new LocalizeSerializerVisitor(message.placeholderToMessage, pieces);
    message.nodes.forEach((node) => node.visit(serializerVisitor));
    return processMessagePieces(pieces);
}
function getSourceSpan(message) {
    const startNode = message.nodes[0];
    const endNode = message.nodes[message.nodes.length - 1];
    return new ParseSourceSpan(startNode.sourceSpan.fullStart, endNode.sourceSpan.end, startNode.sourceSpan.fullStart, startNode.sourceSpan.details);
}
/**
 * Convert the list of serialized MessagePieces into two arrays.
 *
 * One contains the literal string pieces and the other the placeholders that will be replaced by
 * expressions when rendering `$localize` tagged template literals.
 *
 * @param pieces The pieces to process.
 * @returns an object containing the messageParts and placeholders.
 */
function processMessagePieces(pieces) {
    const messageParts = [];
    const placeHolders = [];
    if (pieces[0] instanceof o.PlaceholderPiece) {
        // The first piece was a placeholder so we need to add an initial empty message part.
        messageParts.push(createEmptyMessagePart(pieces[0].sourceSpan.start));
    }
    for (let i = 0; i < pieces.length; i++) {
        const part = pieces[i];
        if (part instanceof o.LiteralPiece) {
            messageParts.push(part);
        }
        else {
            placeHolders.push(part);
            if (pieces[i - 1] instanceof o.PlaceholderPiece) {
                // There were two placeholders in a row, so we need to add an empty message part.
                messageParts.push(createEmptyMessagePart(pieces[i - 1].sourceSpan.end));
            }
        }
    }
    if (pieces[pieces.length - 1] instanceof o.PlaceholderPiece) {
        // The last piece was a placeholder so we need to add a final empty message part.
        messageParts.push(createEmptyMessagePart(pieces[pieces.length - 1].sourceSpan.end));
    }
    return { messageParts, placeHolders };
}
function createEmptyMessagePart(location) {
    return new o.LiteralPiece('', new ParseSourceSpan(location, location));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemVfdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy92aWV3L2kxOG4vbG9jYWxpemVfdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsT0FBTyxLQUFLLENBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNoRCxPQUFPLEVBQWdCLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRW5FLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2xELE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUVqRCxNQUFNLFVBQVUsd0JBQXdCLENBQ3RDLFFBQXVCLEVBQ3ZCLE9BQXFCLEVBQ3JCLE1BQXNDO0lBRXRDLE1BQU0sRUFBQyxZQUFZLEVBQUUsWUFBWSxFQUFDLEdBQUcsK0JBQStCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUUsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFDLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM5RCxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUN2QyxPQUFPLEVBQ1AsWUFBWSxFQUNaLFlBQVksRUFDWixXQUFXLEVBQ1gsVUFBVSxDQUNYLENBQUM7SUFDRixNQUFNLHNCQUFzQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDN0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLG1CQUFtQixDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0seUJBQXlCO0lBQzdCLFlBQ1Usb0JB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Q0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzFFLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUNELElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDNUQsaUZBQWlGO1FBQ2pGLFlBQVksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUNELE9BQU8sRUFBQyxZQUFZLEVBQUUsWUFBWSxFQUFDLENBQUM7QUFDdEMsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQUMsUUFBdUI7SUFDckQsT0FBTyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLElBQUksZUFBZSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uLy4uLy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1BhcnNlTG9jYXRpb24sIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vLi4vLi4vcGFyc2VfdXRpbCc7XG5cbmltcG9ydCB7c2VyaWFsaXplSWN1Tm9kZX0gZnJvbSAnLi9pY3Vfc2VyaWFsaXplcic7XG5pbXBvcnQge2Zvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWV9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2NhbGl6ZVN0YXRlbWVudHMoXG4gIHZhcmlhYmxlOiBvLlJlYWRWYXJFeHByLFxuICBtZXNzYWdlOiBpMThuLk1lc3NhZ2UsXG4gIHBhcmFtczoge1tuYW1lOiBzdHJpbmddOiBvLkV4cHJlc3Npb259LFxuKTogby5TdGF0ZW1lbnRbXSB7XG4gIGNvbnN0IHttZXNzYWdlUGFydHMsIHBsYWNlSG9sZGVyc30gPSBzZXJpYWxpemVJMThuTWVzc2FnZUZvckxvY2FsaXplKG1lc3NhZ2UpO1xuICBjb25zdCBzb3VyY2VTcGFuID0gZ2V0U291cmNlU3BhbihtZXNzYWdlKTtcbiAgY29uc3QgZXhwcmVzc2lvbnMgPSBwbGFjZUhvbGRlcnMubWFwKChwaCkgPT4gcGFyYW1zW3BoLnRleHRdKTtcbiAgY29uc3QgbG9jYWxpemVkU3RyaW5nID0gby5sb2NhbGl6ZWRTdHJpbmcoXG4gICAgbWVzc2FnZSxcbiAgICBtZXNzYWdlUGFydHMsXG4gICAgcGxhY2VIb2xkZXJzLFxuICAgIGV4cHJlc3Npb25zLFxuICAgIHNvdXJjZVNwYW4sXG4gICk7XG4gIGNvbnN0IHZhcmlhYmxlSW5pdGlhbGl6YXRpb24gPSB2YXJpYWJsZS5zZXQobG9jYWxpemVkU3RyaW5nKTtcbiAgcmV0dXJuIFtuZXcgby5FeHByZXNzaW9uU3RhdGVtZW50KHZhcmlhYmxlSW5pdGlhbGl6YXRpb24pXTtcbn1cblxuLyoqXG4gKiBUaGlzIHZpc2l0b3Igd2Fsa3Mgb3ZlciBhbiBpMThuIHRyZWUsIGNhcHR1cmluZyBsaXRlcmFsIHN0cmluZ3MgYW5kIHBsYWNlaG9sZGVycy5cbiAqXG4gKiBUaGUgcmVzdWx0IGNhbiBiZSB1c2VkIGZvciBnZW5lcmF0aW5nIHRoZSBgJGxvY2FsaXplYCB0YWdnZWQgdGVtcGxhdGUgbGl0ZXJhbHMuXG4gKi9cbmNsYXNzIExvY2FsaXplU2VyaWFsaXplclZpc2l0b3IgaW1wbGVtZW50cyBpMThuLlZpc2l0b3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHBsYWNlaG9sZGVyVG9NZXNzYWdlOiB7W3BoTmFtZTogc3RyaW5nXTogaTE4bi5NZXNzYWdlfSxcbiAgICBwcml2YXRlIHBpZWNlczogby5NZXNzYWdlUGllY2VbXSxcbiAgKSB7fVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiBpMThuLlRleHQpOiBhbnkge1xuICAgIGlmICh0aGlzLnBpZWNlc1t0aGlzLnBpZWNlcy5sZW5ndGggLSAxXSBpbnN0YW5jZW9mIG8uTGl0ZXJhbFBpZWNlKSB7XG4gICAgICAvLyBUd28gbGl0ZXJhbCBwaWVjZXMgaW4gYSByb3cgbWVhbnMgdGhhdCB0aGVyZSB3YXMgc29tZSBjb21tZW50IG5vZGUgaW4tYmV0d2Vlbi5cbiAgICAgIHRoaXMucGllY2VzW3RoaXMucGllY2VzLmxlbmd0aCAtIDFdLnRleHQgKz0gdGV4dC52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc291cmNlU3BhbiA9IG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICAgIHRleHQuc291cmNlU3Bhbi5mdWxsU3RhcnQsXG4gICAgICAgIHRleHQuc291cmNlU3Bhbi5lbmQsXG4gICAgICAgIHRleHQuc291cmNlU3Bhbi5mdWxsU3RhcnQsXG4gICAgICAgIHRleHQuc291cmNlU3Bhbi5kZXRhaWxzLFxuICAgICAgKTtcbiAgICAgIHRoaXMucGllY2VzLnB1c2gobmV3IG8uTGl0ZXJhbFBpZWNlKHRleHQudmFsdWUsIHNvdXJjZVNwYW4pKTtcbiAgICB9XG4gIH1cblxuICB2aXNpdENvbnRhaW5lcihjb250YWluZXI6IGkxOG4uQ29udGFpbmVyKTogYW55IHtcbiAgICBjb250YWluZXIuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IGNoaWxkLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0SWN1KGljdTogaTE4bi5JY3UpOiBhbnkge1xuICAgIHRoaXMucGllY2VzLnB1c2gobmV3IG8uTGl0ZXJhbFBpZWNlKHNlcmlhbGl6ZUljdU5vZGUoaWN1KSwgaWN1LnNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHZpc2l0VGFnUGxhY2Vob2xkZXIocGg6IGkxOG4uVGFnUGxhY2Vob2xkZXIpOiBhbnkge1xuICAgIHRoaXMucGllY2VzLnB1c2goXG4gICAgICB0aGlzLmNyZWF0ZVBsYWNlaG9sZGVyUGllY2UocGguc3RhcnROYW1lLCBwaC5zdGFydFNvdXJjZVNwYW4gPz8gcGguc291cmNlU3BhbiksXG4gICAgKTtcbiAgICBpZiAoIXBoLmlzVm9pZCkge1xuICAgICAgcGguY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IGNoaWxkLnZpc2l0KHRoaXMpKTtcbiAgICAgIHRoaXMucGllY2VzLnB1c2goXG4gICAgICAgIHRoaXMuY3JlYXRlUGxhY2Vob2xkZXJQaWVjZShwaC5jbG9zZU5hbWUsIHBoLmVuZFNvdXJjZVNwYW4gPz8gcGguc291cmNlU3BhbiksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0UGxhY2Vob2xkZXIocGg6IGkxOG4uUGxhY2Vob2xkZXIpOiBhbnkge1xuICAgIHRoaXMucGllY2VzLnB1c2godGhpcy5jcmVhdGVQbGFjZWhvbGRlclBpZWNlKHBoLm5hbWUsIHBoLnNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHZpc2l0QmxvY2tQbGFjZWhvbGRlcihwaDogaTE4bi5CbG9ja1BsYWNlaG9sZGVyKTogYW55IHtcbiAgICB0aGlzLnBpZWNlcy5wdXNoKFxuICAgICAgdGhpcy5jcmVhdGVQbGFjZWhvbGRlclBpZWNlKHBoLnN0YXJ0TmFtZSwgcGguc3RhcnRTb3VyY2VTcGFuID8/IHBoLnNvdXJjZVNwYW4pLFxuICAgICk7XG4gICAgcGguY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IGNoaWxkLnZpc2l0KHRoaXMpKTtcbiAgICB0aGlzLnBpZWNlcy5wdXNoKHRoaXMuY3JlYXRlUGxhY2Vob2xkZXJQaWVjZShwaC5jbG9zZU5hbWUsIHBoLmVuZFNvdXJjZVNwYW4gPz8gcGguc291cmNlU3BhbikpO1xuICB9XG5cbiAgdmlzaXRJY3VQbGFjZWhvbGRlcihwaDogaTE4bi5JY3VQbGFjZWhvbGRlcik6IGFueSB7XG4gICAgdGhpcy5waWVjZXMucHVzaChcbiAgICAgIHRoaXMuY3JlYXRlUGxhY2Vob2xkZXJQaWVjZShwaC5uYW1lLCBwaC5zb3VyY2VTcGFuLCB0aGlzLnBsYWNlaG9sZGVyVG9NZXNzYWdlW3BoLm5hbWVdKSxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVQbGFjZWhvbGRlclBpZWNlKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgYXNzb2NpYXRlZE1lc3NhZ2U/OiBpMThuLk1lc3NhZ2UsXG4gICk6IG8uUGxhY2Vob2xkZXJQaWVjZSB7XG4gICAgcmV0dXJuIG5ldyBvLlBsYWNlaG9sZGVyUGllY2UoXG4gICAgICBmb3JtYXRJMThuUGxhY2Vob2xkZXJOYW1lKG5hbWUsIC8qIHVzZUNhbWVsQ2FzZSAqLyBmYWxzZSksXG4gICAgICBzb3VyY2VTcGFuLFxuICAgICAgYXNzb2NpYXRlZE1lc3NhZ2UsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFNlcmlhbGl6ZSBhbiBpMThuIG1lc3NhZ2UgaW50byB0d28gYXJyYXlzOiBtZXNzYWdlUGFydHMgYW5kIHBsYWNlaG9sZGVycy5cbiAqXG4gKiBUaGVzZSBhcnJheXMgd2lsbCBiZSB1c2VkIHRvIGdlbmVyYXRlIGAkbG9jYWxpemVgIHRhZ2dlZCB0ZW1wbGF0ZSBsaXRlcmFscy5cbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBiZSBzZXJpYWxpemVkLlxuICogQHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1lc3NhZ2VQYXJ0cyBhbmQgcGxhY2Vob2xkZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplSTE4bk1lc3NhZ2VGb3JMb2NhbGl6ZShtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOiB7XG4gIG1lc3NhZ2VQYXJ0czogby5MaXRlcmFsUGllY2VbXTtcbiAgcGxhY2VIb2xkZXJzOiBvLlBsYWNlaG9sZGVyUGllY2VbXTtcbn0ge1xuICBjb25zdCBwaWVjZXM6IG8uTWVzc2FnZVBpZWNlW10gPSBbXTtcbiAgY29uc3Qgc2VyaWFsaXplclZpc2l0b3IgPSBuZXcgTG9jYWxpemVTZXJpYWxpemVyVmlzaXRvcihtZXNzYWdlLnBsYWNlaG9sZGVyVG9NZXNzYWdlLCBwaWVjZXMpO1xuICBtZXNzYWdlLm5vZGVzLmZvckVhY2goKG5vZGUpID0+IG5vZGUudmlzaXQoc2VyaWFsaXplclZpc2l0b3IpKTtcbiAgcmV0dXJuIHByb2Nlc3NNZXNzYWdlUGllY2VzKHBpZWNlcyk7XG59XG5cbmZ1bmN0aW9uIGdldFNvdXJjZVNwYW4obWVzc2FnZTogaTE4bi5NZXNzYWdlKTogUGFyc2VTb3VyY2VTcGFuIHtcbiAgY29uc3Qgc3RhcnROb2RlID0gbWVzc2FnZS5ub2Rlc1swXTtcbiAgY29uc3QgZW5kTm9kZSA9IG1lc3NhZ2Uubm9kZXNbbWVzc2FnZS5ub2Rlcy5sZW5ndGggLSAxXTtcbiAgcmV0dXJuIG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgc3RhcnROb2RlLnNvdXJjZVNwYW4uZnVsbFN0YXJ0LFxuICAgIGVuZE5vZGUuc291cmNlU3Bhbi5lbmQsXG4gICAgc3RhcnROb2RlLnNvdXJjZVNwYW4uZnVsbFN0YXJ0LFxuICAgIHN0YXJ0Tm9kZS5zb3VyY2VTcGFuLmRldGFpbHMsXG4gICk7XG59XG5cbi8qKlxuICogQ29udmVydCB0aGUgbGlzdCBvZiBzZXJpYWxpemVkIE1lc3NhZ2VQaWVjZXMgaW50byB0d28gYXJyYXlzLlxuICpcbiAqIE9uZSBjb250YWlucyB0aGUgbGl0ZXJhbCBzdHJpbmcgcGllY2VzIGFuZCB0aGUgb3RoZXIgdGhlIHBsYWNlaG9sZGVycyB0aGF0IHdpbGwgYmUgcmVwbGFjZWQgYnlcbiAqIGV4cHJlc3Npb25zIHdoZW4gcmVuZGVyaW5nIGAkbG9jYWxpemVgIHRhZ2dlZCB0ZW1wbGF0ZSBsaXRlcmFscy5cbiAqXG4gKiBAcGFyYW0gcGllY2VzIFRoZSBwaWVjZXMgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBtZXNzYWdlUGFydHMgYW5kIHBsYWNlaG9sZGVycy5cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc01lc3NhZ2VQaWVjZXMocGllY2VzOiBvLk1lc3NhZ2VQaWVjZVtdKToge1xuICBtZXNzYWdlUGFydHM6IG8uTGl0ZXJhbFBpZWNlW107XG4gIHBsYWNlSG9sZGVyczogby5QbGFjZWhvbGRlclBpZWNlW107XG59IHtcbiAgY29uc3QgbWVzc2FnZVBhcnRzOiBvLkxpdGVyYWxQaWVjZVtdID0gW107XG4gIGNvbnN0IHBsYWNlSG9sZGVyczogby5QbGFjZWhvbGRlclBpZWNlW10gPSBbXTtcblxuICBpZiAocGllY2VzWzBdIGluc3RhbmNlb2Ygby5QbGFjZWhvbGRlclBpZWNlKSB7XG4gICAgLy8gVGhlIGZpcnN0IHBpZWNlIHdhcyBhIHBsYWNlaG9sZGVyIHNvIHdlIG5lZWQgdG8gYWRkIGFuIGluaXRpYWwgZW1wdHkgbWVzc2FnZSBwYXJ0LlxuICAgIG1lc3NhZ2VQYXJ0cy5wdXNoKGNyZWF0ZUVtcHR5TWVzc2FnZVBhcnQocGllY2VzWzBdLnNvdXJjZVNwYW4uc3RhcnQpKTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGllY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcGFydCA9IHBpZWNlc1tpXTtcbiAgICBpZiAocGFydCBpbnN0YW5jZW9mIG8uTGl0ZXJhbFBpZWNlKSB7XG4gICAgICBtZXNzYWdlUGFydHMucHVzaChwYXJ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGxhY2VIb2xkZXJzLnB1c2gocGFydCk7XG4gICAgICBpZiAocGllY2VzW2kgLSAxXSBpbnN0YW5jZW9mIG8uUGxhY2Vob2xkZXJQaWVjZSkge1xuICAgICAgICAvLyBUaGVyZSB3ZXJlIHR3byBwbGFjZWhvbGRlcnMgaW4gYSByb3csIHNvIHdlIG5lZWQgdG8gYWRkIGFuIGVtcHR5IG1lc3NhZ2UgcGFydC5cbiAgICAgICAgbWVzc2FnZVBhcnRzLnB1c2goY3JlYXRlRW1wdHlNZXNzYWdlUGFydChwaWVjZXNbaSAtIDFdLnNvdXJjZVNwYW4uZW5kKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChwaWVjZXNbcGllY2VzLmxlbmd0aCAtIDFdIGluc3RhbmNlb2Ygby5QbGFjZWhvbGRlclBpZWNlKSB7XG4gICAgLy8gVGhlIGxhc3QgcGllY2Ugd2FzIGEgcGxhY2Vob2xkZXIgc28gd2UgbmVlZCB0byBhZGQgYSBmaW5hbCBlbXB0eSBtZXNzYWdlIHBhcnQuXG4gICAgbWVzc2FnZVBhcnRzLnB1c2goY3JlYXRlRW1wdHlNZXNzYWdlUGFydChwaWVjZXNbcGllY2VzLmxlbmd0aCAtIDFdLnNvdXJjZVNwYW4uZW5kKSk7XG4gIH1cbiAgcmV0dXJuIHttZXNzYWdlUGFydHMsIHBsYWNlSG9sZGVyc307XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVtcHR5TWVzc2FnZVBhcnQobG9jYXRpb246IFBhcnNlTG9jYXRpb24pOiBvLkxpdGVyYWxQaWVjZSB7XG4gIHJldHVybiBuZXcgby5MaXRlcmFsUGllY2UoJycsIG5ldyBQYXJzZVNvdXJjZVNwYW4obG9jYXRpb24sIGxvY2F0aW9uKSk7XG59XG4iXX0=