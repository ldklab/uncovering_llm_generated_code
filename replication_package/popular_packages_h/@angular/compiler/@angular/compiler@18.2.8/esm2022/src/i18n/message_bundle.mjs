/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { WhitespaceVisitor, visitAllWithSiblings } from '../ml_parser/html_whitespaces';
import { extractMessages } from './extractor_merger';
import * as i18n from './i18n_ast';
/**
 * A container for message extracted from the templates.
 */
export class MessageBundle {
    constructor(_htmlParser, _implicitTags, _implicitAttrs, _locale = null, _preserveWhitespace = true) {
        this._htmlParser = _htmlParser;
        this._implicitTags = _implicitTags;
        this._implicitAttrs = _implicitAttrs;
        this._locale = _locale;
        this._preserveWhitespace = _preserveWhitespace;
        this._messages = [];
    }
    updateFromTemplate(source, url, interpolationConfig) {
        const htmlParserResult = this._htmlParser.parse(source, url, {
            tokenizeExpansionForms: true,
            interpolationConfig,
        });
        if (htmlParserResult.errors.length) {
            return htmlParserResult.errors;
        }
        // Trim unnecessary whitespace from extracted messages if requested. This
        // makes the messages more durable to trivial whitespace changes without
        // affected message IDs.
        const rootNodes = this._preserveWhitespace
            ? htmlParserResult.rootNodes
            : visitAllWithSiblings(new WhitespaceVisitor(/* preserveSignificantWhitespace */ false), htmlParserResult.rootNodes);
        const i18nParserResult = extractMessages(rootNodes, interpolationConfig, this._implicitTags, this._implicitAttrs, 
        /* preserveSignificantWhitespace */ this._preserveWhitespace);
        if (i18nParserResult.errors.length) {
            return i18nParserResult.errors;
        }
        this._messages.push(...i18nParserResult.messages);
        return [];
    }
    // Return the message in the internal format
    // The public (serialized) format might be different, see the `write` method.
    getMessages() {
        return this._messages;
    }
    write(serializer, filterSources) {
        const messages = {};
        const mapperVisitor = new MapPlaceholderNames();
        // Deduplicate messages based on their ID
        this._messages.forEach((message) => {
            const id = serializer.digest(message);
            if (!messages.hasOwnProperty(id)) {
                messages[id] = message;
            }
            else {
                messages[id].sources.push(...message.sources);
            }
        });
        // Transform placeholder names using the serializer mapping
        const msgList = Object.keys(messages).map((id) => {
            const mapper = serializer.createNameMapper(messages[id]);
            const src = messages[id];
            const nodes = mapper ? mapperVisitor.convert(src.nodes, mapper) : src.nodes;
            let transformedMessage = new i18n.Message(nodes, {}, {}, src.meaning, src.description, id);
            transformedMessage.sources = src.sources;
            if (filterSources) {
                transformedMessage.sources.forEach((source) => (source.filePath = filterSources(source.filePath)));
            }
            return transformedMessage;
        });
        return serializer.write(msgList, this._locale);
    }
}
// Transform an i18n AST by renaming the placeholder nodes with the given mapper
class MapPlaceholderNames extends i18n.CloneVisitor {
    convert(nodes, mapper) {
        return mapper ? nodes.map((n) => n.visit(this, mapper)) : nodes;
    }
    visitTagPlaceholder(ph, mapper) {
        const startName = mapper.toPublicName(ph.startName);
        const closeName = ph.closeName ? mapper.toPublicName(ph.closeName) : ph.closeName;
        const children = ph.children.map((n) => n.visit(this, mapper));
        return new i18n.TagPlaceholder(ph.tag, ph.attrs, startName, closeName, children, ph.isVoid, ph.sourceSpan, ph.startSourceSpan, ph.endSourceSpan);
    }
    visitBlockPlaceholder(ph, mapper) {
        const startName = mapper.toPublicName(ph.startName);
        const closeName = ph.closeName ? mapper.toPublicName(ph.closeName) : ph.closeName;
        const children = ph.children.map((n) => n.visit(this, mapper));
        return new i18n.BlockPlaceholder(ph.name, ph.parameters, startName, closeName, children, ph.sourceSpan, ph.startSourceSpan, ph.endSourceSpan);
    }
    visitPlaceholder(ph, mapper) {
        return new i18n.Placeholder(ph.value, mapper.toPublicName(ph.name), ph.sourceSpan);
    }
    visitIcuPlaceholder(ph, mapper) {
        return new i18n.IcuPlaceholder(ph.value, mapper.toPublicName(ph.name), ph.sourceSpan);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZV9idW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvaTE4bi9tZXNzYWdlX2J1bmRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUd0RixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxLQUFLLElBQUksTUFBTSxZQUFZLENBQUM7QUFHbkM7O0dBRUc7QUFDSCxNQUFNLE9BQU8sYUFBYTtJQUd4QixZQUNVLFdBQXVCLEVBQ3ZCLGFBQXVCLEVBQ3ZCLGNBQXVDLEVBQ3ZDLFVBQXlCLElBQUksRUFDcEIsc0JBQXNCLElBQUk7UUFKbkMsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFDdkIsa0JBQWEsR0FBYixhQUFhLENBQVU7UUFDdkIsbUJBQWMsR0FBZCxjQUFjLENBQXlCO1FBQ3ZDLFlBQU8sR0FBUCxPQUFPLENBQXNCO1FBQ3BCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBTztRQVByQyxjQUFTLEdBQW1CLEVBQUUsQ0FBQztJQVFwQyxDQUFDO0lBRUosa0JBQWtCLENBQ2hCLE1BQWMsRUFDZCxHQUFXLEVBQ1gsbUJBQXdDO1FBRXhDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtZQUMzRCxzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLG1CQUFtQjtTQUNwQixDQUFDLENBQUM7UUFFSCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNuQyxPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztRQUNqQyxDQUFDO1FBRUQseUVBQXlFO1FBQ3pFLHdFQUF3RTtRQUN4RSx3QkFBd0I7UUFDeEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLG1CQUFtQjtZQUN4QyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsU0FBUztZQUM1QixDQUFDLENBQUMsb0JBQW9CLENBQ2xCLElBQUksaUJBQWlCLENBQUMsbUNBQW1DLENBQUMsS0FBSyxDQUFDLEVBQ2hFLGdCQUFnQixDQUFDLFNBQVMsQ0FDM0IsQ0FBQztRQUVOLE1BQU0sZ0JBQWdCLEdBQUcsZUFBZSxDQUN0QyxTQUFTLEVBQ1QsbUJBQW1CLEVBQ25CLElBQUksQ0FBQyxhQUFhLEVBQ2xCLElBQUksQ0FBQyxjQUFjO1FBQ25CLG1DQUFtQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FDN0QsQ0FBQztRQUVGLElBQUksZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ25DLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1FBQ2pDLENBQUM7UUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVELDRDQUE0QztJQUM1Qyw2RUFBNkU7SUFDN0UsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQXNCLEVBQUUsYUFBd0M7UUFDcEUsTUFBTSxRQUFRLEdBQWlDLEVBQUUsQ0FBQztRQUNsRCxNQUFNLGFBQWEsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFFaEQseUNBQXlDO1FBQ3pDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDakMsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDO1lBQ3pCLENBQUM7aUJBQU0sQ0FBQztnQkFDTixRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoRCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCwyREFBMkQ7UUFDM0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUMvQyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekQsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1lBQzVFLElBQUksa0JBQWtCLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzRixrQkFBa0IsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUN6QyxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUNsQixrQkFBa0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUNoQyxDQUFDLE1BQXdCLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQ2pGLENBQUM7WUFDSixDQUFDO1lBQ0QsT0FBTyxrQkFBa0IsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELENBQUM7Q0FDRjtBQUVELGdGQUFnRjtBQUNoRixNQUFNLG1CQUFvQixTQUFRLElBQUksQ0FBQyxZQUFZO0lBQ2pELE9BQU8sQ0FBQyxLQUFrQixFQUFFLE1BQXlCO1FBQ25ELE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDbEUsQ0FBQztJQUVRLG1CQUFtQixDQUMxQixFQUF1QixFQUN2QixNQUF5QjtRQUV6QixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUUsQ0FBQztRQUNyRCxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQztRQUNuRixNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMvRCxPQUFPLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FDNUIsRUFBRSxDQUFDLEdBQUcsRUFDTixFQUFFLENBQUMsS0FBSyxFQUNSLFNBQVMsRUFDVCxTQUFTLEVBQ1QsUUFBUSxFQUNSLEVBQUUsQ0FBQyxNQUFNLEVBQ1QsRUFBRSxDQUFDLFVBQVUsRUFDYixFQUFFLENBQUMsZUFBZSxFQUNsQixFQUFFLENBQUMsYUFBYSxDQUNqQixDQUFDO0lBQ0osQ0FBQztJQUVRLHFCQUFxQixDQUM1QixFQUF5QixFQUN6QixNQUF5QjtRQUV6QixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUUsQ0FBQztRQUNyRCxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQztRQUNuRixNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMvRCxPQUFPLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUM5QixFQUFFLENBQUMsSUFBSSxFQUNQLEVBQUUsQ0FBQyxVQUFVLEVBQ2IsU0FBUyxFQUNULFNBQVMsRUFDVCxRQUFRLEVBQ1IsRUFBRSxDQUFDLFVBQVUsRUFDYixFQUFFLENBQUMsZUFBZSxFQUNsQixFQUFFLENBQUMsYUFBYSxDQUNqQixDQUFDO0lBQ0osQ0FBQztJQUVRLGdCQUFnQixDQUFDLEVBQW9CLEVBQUUsTUFBeUI7UUFDdkUsT0FBTyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUUsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUVRLG1CQUFtQixDQUMxQixFQUF1QixFQUN2QixNQUF5QjtRQUV6QixPQUFPLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBRSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN6RixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi4vbWxfcGFyc2VyL2RlZmF1bHRzJztcbmltcG9ydCB7SHRtbFBhcnNlcn0gZnJvbSAnLi4vbWxfcGFyc2VyL2h0bWxfcGFyc2VyJztcbmltcG9ydCB7V2hpdGVzcGFjZVZpc2l0b3IsIHZpc2l0QWxsV2l0aFNpYmxpbmdzfSBmcm9tICcuLi9tbF9wYXJzZXIvaHRtbF93aGl0ZXNwYWNlcyc7XG5pbXBvcnQge1BhcnNlRXJyb3J9IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5pbXBvcnQge2V4dHJhY3RNZXNzYWdlc30gZnJvbSAnLi9leHRyYWN0b3JfbWVyZ2VyJztcbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi9pMThuX2FzdCc7XG5pbXBvcnQge1BsYWNlaG9sZGVyTWFwcGVyLCBTZXJpYWxpemVyfSBmcm9tICcuL3NlcmlhbGl6ZXJzL3NlcmlhbGl6ZXInO1xuXG4vKipcbiAqIEEgY29udGFpbmVyIGZvciBtZXNzYWdlIGV4dHJhY3RlZCBmcm9tIHRoZSB0ZW1wbGF0ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZXNzYWdlQnVuZGxlIHtcbiAgcHJpdmF0ZSBfbWVzc2FnZXM6IGkxOG4uTWVzc2FnZVtdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfaHRtbFBhcnNlcjogSHRtbFBhcnNlcixcbiAgICBwcml2YXRlIF9pbXBsaWNpdFRhZ3M6IHN0cmluZ1tdLFxuICAgIHByaXZhdGUgX2ltcGxpY2l0QXR0cnM6IHtbazogc3RyaW5nXTogc3RyaW5nW119LFxuICAgIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nIHwgbnVsbCA9IG51bGwsXG4gICAgcHJpdmF0ZSByZWFkb25seSBfcHJlc2VydmVXaGl0ZXNwYWNlID0gdHJ1ZSxcbiAgKSB7fVxuXG4gIHVwZGF0ZUZyb21UZW1wbGF0ZShcbiAgICBzb3VyY2U6IHN0cmluZyxcbiAgICB1cmw6IHN0cmluZyxcbiAgICBpbnRlcnBvbGF0aW9uQ29uZmlnOiBJbnRlcnBvbGF0aW9uQ29uZmlnLFxuICApOiBQYXJzZUVycm9yW10ge1xuICAgIGNvbnN0IGh0bWxQYXJzZXJSZXN1bHQgPSB0aGlzLl9odG1sUGFyc2VyLnBhcnNlKHNvdXJjZSwgdXJsLCB7XG4gICAgICB0b2tlbml6ZUV4cGFuc2lvbkZvcm1zOiB0cnVlLFxuICAgICAgaW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICB9KTtcblxuICAgIGlmIChodG1sUGFyc2VyUmVzdWx0LmVycm9ycy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBodG1sUGFyc2VyUmVzdWx0LmVycm9ycztcbiAgICB9XG5cbiAgICAvLyBUcmltIHVubmVjZXNzYXJ5IHdoaXRlc3BhY2UgZnJvbSBleHRyYWN0ZWQgbWVzc2FnZXMgaWYgcmVxdWVzdGVkLiBUaGlzXG4gICAgLy8gbWFrZXMgdGhlIG1lc3NhZ2VzIG1vcmUgZHVyYWJsZSB0byB0cml2aWFsIHdoaXRlc3BhY2UgY2hhbmdlcyB3aXRob3V0XG4gICAgLy8gYWZmZWN0ZWQgbWVzc2FnZSBJRHMuXG4gICAgY29uc3Qgcm9vdE5vZGVzID0gdGhpcy5fcHJlc2VydmVXaGl0ZXNwYWNlXG4gICAgICA/IGh0bWxQYXJzZXJSZXN1bHQucm9vdE5vZGVzXG4gICAgICA6IHZpc2l0QWxsV2l0aFNpYmxpbmdzKFxuICAgICAgICAgIG5ldyBXaGl0ZXNwYWNlVmlzaXRvcigvKiBwcmVzZXJ2ZVNpZ25pZmljYW50V2hpdGVzcGFjZSAqLyBmYWxzZSksXG4gICAgICAgICAgaHRtbFBhcnNlclJlc3VsdC5yb290Tm9kZXMsXG4gICAgICAgICk7XG5cbiAgICBjb25zdCBpMThuUGFyc2VyUmVzdWx0ID0gZXh0cmFjdE1lc3NhZ2VzKFxuICAgICAgcm9vdE5vZGVzLFxuICAgICAgaW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICAgIHRoaXMuX2ltcGxpY2l0VGFncyxcbiAgICAgIHRoaXMuX2ltcGxpY2l0QXR0cnMsXG4gICAgICAvKiBwcmVzZXJ2ZVNpZ25pZmljYW50V2hpdGVzcGFjZSAqLyB0aGlzLl9wcmVzZXJ2ZVdoaXRlc3BhY2UsXG4gICAgKTtcblxuICAgIGlmIChpMThuUGFyc2VyUmVzdWx0LmVycm9ycy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBpMThuUGFyc2VyUmVzdWx0LmVycm9ycztcbiAgICB9XG5cbiAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKC4uLmkxOG5QYXJzZXJSZXN1bHQubWVzc2FnZXMpO1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgbWVzc2FnZSBpbiB0aGUgaW50ZXJuYWwgZm9ybWF0XG4gIC8vIFRoZSBwdWJsaWMgKHNlcmlhbGl6ZWQpIGZvcm1hdCBtaWdodCBiZSBkaWZmZXJlbnQsIHNlZSB0aGUgYHdyaXRlYCBtZXRob2QuXG4gIGdldE1lc3NhZ2VzKCk6IGkxOG4uTWVzc2FnZVtdIHtcbiAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXM7XG4gIH1cblxuICB3cml0ZShzZXJpYWxpemVyOiBTZXJpYWxpemVyLCBmaWx0ZXJTb3VyY2VzPzogKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBtZXNzYWdlczoge1tpZDogc3RyaW5nXTogaTE4bi5NZXNzYWdlfSA9IHt9O1xuICAgIGNvbnN0IG1hcHBlclZpc2l0b3IgPSBuZXcgTWFwUGxhY2Vob2xkZXJOYW1lcygpO1xuXG4gICAgLy8gRGVkdXBsaWNhdGUgbWVzc2FnZXMgYmFzZWQgb24gdGhlaXIgSURcbiAgICB0aGlzLl9tZXNzYWdlcy5mb3JFYWNoKChtZXNzYWdlKSA9PiB7XG4gICAgICBjb25zdCBpZCA9IHNlcmlhbGl6ZXIuZGlnZXN0KG1lc3NhZ2UpO1xuICAgICAgaWYgKCFtZXNzYWdlcy5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAgICAgbWVzc2FnZXNbaWRdID0gbWVzc2FnZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lc3NhZ2VzW2lkXS5zb3VyY2VzLnB1c2goLi4ubWVzc2FnZS5zb3VyY2VzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRyYW5zZm9ybSBwbGFjZWhvbGRlciBuYW1lcyB1c2luZyB0aGUgc2VyaWFsaXplciBtYXBwaW5nXG4gICAgY29uc3QgbXNnTGlzdCA9IE9iamVjdC5rZXlzKG1lc3NhZ2VzKS5tYXAoKGlkKSA9PiB7XG4gICAgICBjb25zdCBtYXBwZXIgPSBzZXJpYWxpemVyLmNyZWF0ZU5hbWVNYXBwZXIobWVzc2FnZXNbaWRdKTtcbiAgICAgIGNvbnN0IHNyYyA9IG1lc3NhZ2VzW2lkXTtcbiAgICAgIGNvbnN0IG5vZGVzID0gbWFwcGVyID8gbWFwcGVyVmlzaXRvci5jb252ZXJ0KHNyYy5ub2RlcywgbWFwcGVyKSA6IHNyYy5ub2RlcztcbiAgICAgIGxldCB0cmFuc2Zvcm1lZE1lc3NhZ2UgPSBuZXcgaTE4bi5NZXNzYWdlKG5vZGVzLCB7fSwge30sIHNyYy5tZWFuaW5nLCBzcmMuZGVzY3JpcHRpb24sIGlkKTtcbiAgICAgIHRyYW5zZm9ybWVkTWVzc2FnZS5zb3VyY2VzID0gc3JjLnNvdXJjZXM7XG4gICAgICBpZiAoZmlsdGVyU291cmNlcykge1xuICAgICAgICB0cmFuc2Zvcm1lZE1lc3NhZ2Uuc291cmNlcy5mb3JFYWNoKFxuICAgICAgICAgIChzb3VyY2U6IGkxOG4uTWVzc2FnZVNwYW4pID0+IChzb3VyY2UuZmlsZVBhdGggPSBmaWx0ZXJTb3VyY2VzKHNvdXJjZS5maWxlUGF0aCkpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkTWVzc2FnZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBzZXJpYWxpemVyLndyaXRlKG1zZ0xpc3QsIHRoaXMuX2xvY2FsZSk7XG4gIH1cbn1cblxuLy8gVHJhbnNmb3JtIGFuIGkxOG4gQVNUIGJ5IHJlbmFtaW5nIHRoZSBwbGFjZWhvbGRlciBub2RlcyB3aXRoIHRoZSBnaXZlbiBtYXBwZXJcbmNsYXNzIE1hcFBsYWNlaG9sZGVyTmFtZXMgZXh0ZW5kcyBpMThuLkNsb25lVmlzaXRvciB7XG4gIGNvbnZlcnQobm9kZXM6IGkxOG4uTm9kZVtdLCBtYXBwZXI6IFBsYWNlaG9sZGVyTWFwcGVyKTogaTE4bi5Ob2RlW10ge1xuICAgIHJldHVybiBtYXBwZXIgPyBub2Rlcy5tYXAoKG4pID0+IG4udmlzaXQodGhpcywgbWFwcGVyKSkgOiBub2RlcztcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0VGFnUGxhY2Vob2xkZXIoXG4gICAgcGg6IGkxOG4uVGFnUGxhY2Vob2xkZXIsXG4gICAgbWFwcGVyOiBQbGFjZWhvbGRlck1hcHBlcixcbiAgKTogaTE4bi5UYWdQbGFjZWhvbGRlciB7XG4gICAgY29uc3Qgc3RhcnROYW1lID0gbWFwcGVyLnRvUHVibGljTmFtZShwaC5zdGFydE5hbWUpITtcbiAgICBjb25zdCBjbG9zZU5hbWUgPSBwaC5jbG9zZU5hbWUgPyBtYXBwZXIudG9QdWJsaWNOYW1lKHBoLmNsb3NlTmFtZSkhIDogcGguY2xvc2VOYW1lO1xuICAgIGNvbnN0IGNoaWxkcmVuID0gcGguY2hpbGRyZW4ubWFwKChuKSA9PiBuLnZpc2l0KHRoaXMsIG1hcHBlcikpO1xuICAgIHJldHVybiBuZXcgaTE4bi5UYWdQbGFjZWhvbGRlcihcbiAgICAgIHBoLnRhZyxcbiAgICAgIHBoLmF0dHJzLFxuICAgICAgc3RhcnROYW1lLFxuICAgICAgY2xvc2VOYW1lLFxuICAgICAgY2hpbGRyZW4sXG4gICAgICBwaC5pc1ZvaWQsXG4gICAgICBwaC5zb3VyY2VTcGFuLFxuICAgICAgcGguc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgcGguZW5kU291cmNlU3BhbixcbiAgICApO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRCbG9ja1BsYWNlaG9sZGVyKFxuICAgIHBoOiBpMThuLkJsb2NrUGxhY2Vob2xkZXIsXG4gICAgbWFwcGVyOiBQbGFjZWhvbGRlck1hcHBlcixcbiAgKTogaTE4bi5CbG9ja1BsYWNlaG9sZGVyIHtcbiAgICBjb25zdCBzdGFydE5hbWUgPSBtYXBwZXIudG9QdWJsaWNOYW1lKHBoLnN0YXJ0TmFtZSkhO1xuICAgIGNvbnN0IGNsb3NlTmFtZSA9IHBoLmNsb3NlTmFtZSA/IG1hcHBlci50b1B1YmxpY05hbWUocGguY2xvc2VOYW1lKSEgOiBwaC5jbG9zZU5hbWU7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBwaC5jaGlsZHJlbi5tYXAoKG4pID0+IG4udmlzaXQodGhpcywgbWFwcGVyKSk7XG4gICAgcmV0dXJuIG5ldyBpMThuLkJsb2NrUGxhY2Vob2xkZXIoXG4gICAgICBwaC5uYW1lLFxuICAgICAgcGgucGFyYW1ldGVycyxcbiAgICAgIHN0YXJ0TmFtZSxcbiAgICAgIGNsb3NlTmFtZSxcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgcGguc291cmNlU3BhbixcbiAgICAgIHBoLnN0YXJ0U291cmNlU3BhbixcbiAgICAgIHBoLmVuZFNvdXJjZVNwYW4sXG4gICAgKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0UGxhY2Vob2xkZXIocGg6IGkxOG4uUGxhY2Vob2xkZXIsIG1hcHBlcjogUGxhY2Vob2xkZXJNYXBwZXIpOiBpMThuLlBsYWNlaG9sZGVyIHtcbiAgICByZXR1cm4gbmV3IGkxOG4uUGxhY2Vob2xkZXIocGgudmFsdWUsIG1hcHBlci50b1B1YmxpY05hbWUocGgubmFtZSkhLCBwaC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0SWN1UGxhY2Vob2xkZXIoXG4gICAgcGg6IGkxOG4uSWN1UGxhY2Vob2xkZXIsXG4gICAgbWFwcGVyOiBQbGFjZWhvbGRlck1hcHBlcixcbiAgKTogaTE4bi5JY3VQbGFjZWhvbGRlciB7XG4gICAgcmV0dXJuIG5ldyBpMThuLkljdVBsYWNlaG9sZGVyKHBoLnZhbHVlLCBtYXBwZXIudG9QdWJsaWNOYW1lKHBoLm5hbWUpISwgcGguc291cmNlU3Bhbik7XG4gIH1cbn1cbiJdfQ==