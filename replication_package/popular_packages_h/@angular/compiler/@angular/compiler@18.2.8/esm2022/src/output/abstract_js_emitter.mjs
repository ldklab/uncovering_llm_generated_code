/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AbstractEmitterVisitor, escapeIdentifier } from './abstract_emitter';
import * as o from './output_ast';
/**
 * In TypeScript, tagged template functions expect a "template object", which is an array of
 * "cooked" strings plus a `raw` property that contains an array of "raw" strings. This is
 * typically constructed with a function called `__makeTemplateObject(cooked, raw)`, but it may not
 * be available in all environments.
 *
 * This is a JavaScript polyfill that uses __makeTemplateObject when it's available, but otherwise
 * creates an inline helper with the same functionality.
 *
 * In the inline function, if `Object.defineProperty` is available we use that to attach the `raw`
 * array.
 */
const makeTemplateObjectPolyfill = '(this&&this.__makeTemplateObject||function(e,t){return Object.defineProperty?Object.defineProperty(e,"raw",{value:t}):e.raw=t,e})';
export class AbstractJsEmitterVisitor extends AbstractEmitterVisitor {
    constructor() {
        super(false);
    }
    visitWrappedNodeExpr(ast, ctx) {
        throw new Error('Cannot emit a WrappedNodeExpr in Javascript.');
    }
    visitDeclareVarStmt(stmt, ctx) {
        ctx.print(stmt, `var ${stmt.name}`);
        if (stmt.value) {
            ctx.print(stmt, ' = ');
            stmt.value.visitExpression(this, ctx);
        }
        ctx.println(stmt, `;`);
        return null;
    }
    visitTaggedTemplateExpr(ast, ctx) {
        // The following convoluted piece of code is effectively the downlevelled equivalent of
        // ```
        // tag`...`
        // ```
        // which is effectively like:
        // ```
        // tag(__makeTemplateObject(cooked, raw), expression1, expression2, ...);
        // ```
        const elements = ast.template.elements;
        ast.tag.visitExpression(this, ctx);
        ctx.print(ast, `(${makeTemplateObjectPolyfill}(`);
        ctx.print(ast, `[${elements.map((part) => escapeIdentifier(part.text, false)).join(', ')}], `);
        ctx.print(ast, `[${elements.map((part) => escapeIdentifier(part.rawText, false)).join(', ')}])`);
        ast.template.expressions.forEach((expression) => {
            ctx.print(ast, ', ');
            expression.visitExpression(this, ctx);
        });
        ctx.print(ast, ')');
        return null;
    }
    visitFunctionExpr(ast, ctx) {
        ctx.print(ast, `function${ast.name ? ' ' + ast.name : ''}(`);
        this._visitParams(ast.params, ctx);
        ctx.println(ast, `) {`);
        ctx.incIndent();
        this.visitAllStatements(ast.statements, ctx);
        ctx.decIndent();
        ctx.print(ast, `}`);
        return null;
    }
    visitArrowFunctionExpr(ast, ctx) {
        ctx.print(ast, '(');
        this._visitParams(ast.params, ctx);
        ctx.print(ast, ') =>');
        if (Array.isArray(ast.body)) {
            ctx.println(ast, `{`);
            ctx.incIndent();
            this.visitAllStatements(ast.body, ctx);
            ctx.decIndent();
            ctx.print(ast, `}`);
        }
        else {
            const isObjectLiteral = ast.body instanceof o.LiteralMapExpr;
            if (isObjectLiteral) {
                ctx.print(ast, '(');
            }
            ast.body.visitExpression(this, ctx);
            if (isObjectLiteral) {
                ctx.print(ast, ')');
            }
        }
        return null;
    }
    visitDeclareFunctionStmt(stmt, ctx) {
        ctx.print(stmt, `function ${stmt.name}(`);
        this._visitParams(stmt.params, ctx);
        ctx.println(stmt, `) {`);
        ctx.incIndent();
        this.visitAllStatements(stmt.statements, ctx);
        ctx.decIndent();
        ctx.println(stmt, `}`);
        return null;
    }
    visitLocalizedString(ast, ctx) {
        // The following convoluted piece of code is effectively the downlevelled equivalent of
        // ```
        // $localize `...`
        // ```
        // which is effectively like:
        // ```
        // $localize(__makeTemplateObject(cooked, raw), expression1, expression2, ...);
        // ```
        ctx.print(ast, `$localize(${makeTemplateObjectPolyfill}(`);
        const parts = [ast.serializeI18nHead()];
        for (let i = 1; i < ast.messageParts.length; i++) {
            parts.push(ast.serializeI18nTemplatePart(i));
        }
        ctx.print(ast, `[${parts.map((part) => escapeIdentifier(part.cooked, false)).join(', ')}], `);
        ctx.print(ast, `[${parts.map((part) => escapeIdentifier(part.raw, false)).join(', ')}])`);
        ast.expressions.forEach((expression) => {
            ctx.print(ast, ', ');
            expression.visitExpression(this, ctx);
        });
        ctx.print(ast, ')');
        return null;
    }
    _visitParams(params, ctx) {
        this.visitAllObjects((param) => ctx.print(null, param.name), params, ctx, ',');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RfanNfZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9vdXRwdXQvYWJzdHJhY3RfanNfZW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsc0JBQXNCLEVBQXlCLGdCQUFnQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbkcsT0FBTyxLQUFLLENBQUMsTUFBTSxjQUFjLENBQUM7QUFFbEM7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxNQUFNLDBCQUEwQixHQUM5QixtSUFBbUksQ0FBQztBQUV0SSxNQUFNLE9BQWdCLHdCQUF5QixTQUFRLHNCQUFzQjtJQUMzRTtRQUNFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFUSxvQkFBb0IsQ0FBQyxHQUEyQixFQUFFLEdBQTBCO1FBQ25GLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRVEsbUJBQW1CLENBQUMsSUFBc0IsRUFBRSxHQUEwQjtRQUM3RSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2YsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFDRCxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDUSx1QkFBdUIsQ0FBQyxHQUF5QixFQUFFLEdBQTBCO1FBQ3BGLHVGQUF1RjtRQUN2RixNQUFNO1FBQ04sV0FBVztRQUNYLE1BQU07UUFDTiw2QkFBNkI7UUFDN0IsTUFBTTtRQUNOLHlFQUF5RTtRQUN6RSxNQUFNO1FBQ04sTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7UUFDdkMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksMEJBQTBCLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0YsR0FBRyxDQUFDLEtBQUssQ0FDUCxHQUFHLEVBQ0gsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQ2pGLENBQUM7UUFDRixHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyQixVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztRQUNILEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNRLGlCQUFpQixDQUFDLEdBQW1CLEVBQUUsR0FBMEI7UUFDeEUsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbkMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEIsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNwQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDUSxzQkFBc0IsQ0FBQyxHQUF3QixFQUFFLEdBQTBCO1FBQ2xGLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV2QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDNUIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDdEIsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNoQixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QixDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUU3RCxJQUFJLGVBQWUsRUFBRSxDQUFDO2dCQUNwQixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN0QixDQUFDO1lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRXBDLElBQUksZUFBZSxFQUFFLENBQUM7Z0JBQ3BCLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ1Esd0JBQXdCLENBQUMsSUFBMkIsRUFBRSxHQUEwQjtRQUN2RixHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxZQUFZLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNwQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6QixHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDOUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNRLG9CQUFvQixDQUFDLEdBQXNCLEVBQUUsR0FBMEI7UUFDOUUsdUZBQXVGO1FBQ3ZGLE1BQU07UUFDTixrQkFBa0I7UUFDbEIsTUFBTTtRQUNOLDZCQUE2QjtRQUM3QixNQUFNO1FBQ04sK0VBQStFO1FBQy9FLE1BQU07UUFDTixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLDBCQUEwQixHQUFHLENBQUMsQ0FBQztRQUMzRCxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDeEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDakQsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5RixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFGLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDckMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckIsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNwQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTyxZQUFZLENBQUMsTUFBbUIsRUFBRSxHQUEwQjtRQUNsRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7QWJzdHJhY3RFbWl0dGVyVmlzaXRvciwgRW1pdHRlclZpc2l0b3JDb250ZXh0LCBlc2NhcGVJZGVudGlmaWVyfSBmcm9tICcuL2Fic3RyYWN0X2VtaXR0ZXInO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuL291dHB1dF9hc3QnO1xuXG4vKipcbiAqIEluIFR5cGVTY3JpcHQsIHRhZ2dlZCB0ZW1wbGF0ZSBmdW5jdGlvbnMgZXhwZWN0IGEgXCJ0ZW1wbGF0ZSBvYmplY3RcIiwgd2hpY2ggaXMgYW4gYXJyYXkgb2ZcbiAqIFwiY29va2VkXCIgc3RyaW5ncyBwbHVzIGEgYHJhd2AgcHJvcGVydHkgdGhhdCBjb250YWlucyBhbiBhcnJheSBvZiBcInJhd1wiIHN0cmluZ3MuIFRoaXMgaXNcbiAqIHR5cGljYWxseSBjb25zdHJ1Y3RlZCB3aXRoIGEgZnVuY3Rpb24gY2FsbGVkIGBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdylgLCBidXQgaXQgbWF5IG5vdFxuICogYmUgYXZhaWxhYmxlIGluIGFsbCBlbnZpcm9ubWVudHMuXG4gKlxuICogVGhpcyBpcyBhIEphdmFTY3JpcHQgcG9seWZpbGwgdGhhdCB1c2VzIF9fbWFrZVRlbXBsYXRlT2JqZWN0IHdoZW4gaXQncyBhdmFpbGFibGUsIGJ1dCBvdGhlcndpc2VcbiAqIGNyZWF0ZXMgYW4gaW5saW5lIGhlbHBlciB3aXRoIHRoZSBzYW1lIGZ1bmN0aW9uYWxpdHkuXG4gKlxuICogSW4gdGhlIGlubGluZSBmdW5jdGlvbiwgaWYgYE9iamVjdC5kZWZpbmVQcm9wZXJ0eWAgaXMgYXZhaWxhYmxlIHdlIHVzZSB0aGF0IHRvIGF0dGFjaCB0aGUgYHJhd2BcbiAqIGFycmF5LlxuICovXG5jb25zdCBtYWtlVGVtcGxhdGVPYmplY3RQb2x5ZmlsbCA9XG4gICcodGhpcyYmdGhpcy5fX21ha2VUZW1wbGF0ZU9iamVjdHx8ZnVuY3Rpb24oZSx0KXtyZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5P09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwicmF3XCIse3ZhbHVlOnR9KTplLnJhdz10LGV9KSc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBYnN0cmFjdEpzRW1pdHRlclZpc2l0b3IgZXh0ZW5kcyBBYnN0cmFjdEVtaXR0ZXJWaXNpdG9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoZmFsc2UpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRXcmFwcGVkTm9kZUV4cHIoYXN0OiBvLldyYXBwZWROb2RlRXhwcjxhbnk+LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZW1pdCBhIFdyYXBwZWROb2RlRXhwciBpbiBKYXZhc2NyaXB0LicpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXREZWNsYXJlVmFyU3RtdChzdG10OiBvLkRlY2xhcmVWYXJTdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KHN0bXQsIGB2YXIgJHtzdG10Lm5hbWV9YCk7XG4gICAgaWYgKHN0bXQudmFsdWUpIHtcbiAgICAgIGN0eC5wcmludChzdG10LCAnID0gJyk7XG4gICAgICBzdG10LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIH1cbiAgICBjdHgucHJpbnRsbihzdG10LCBgO2ApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIG92ZXJyaWRlIHZpc2l0VGFnZ2VkVGVtcGxhdGVFeHByKGFzdDogby5UYWdnZWRUZW1wbGF0ZUV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICAvLyBUaGUgZm9sbG93aW5nIGNvbnZvbHV0ZWQgcGllY2Ugb2YgY29kZSBpcyBlZmZlY3RpdmVseSB0aGUgZG93bmxldmVsbGVkIGVxdWl2YWxlbnQgb2ZcbiAgICAvLyBgYGBcbiAgICAvLyB0YWdgLi4uYFxuICAgIC8vIGBgYFxuICAgIC8vIHdoaWNoIGlzIGVmZmVjdGl2ZWx5IGxpa2U6XG4gICAgLy8gYGBgXG4gICAgLy8gdGFnKF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSwgZXhwcmVzc2lvbjEsIGV4cHJlc3Npb24yLCAuLi4pO1xuICAgIC8vIGBgYFxuICAgIGNvbnN0IGVsZW1lbnRzID0gYXN0LnRlbXBsYXRlLmVsZW1lbnRzO1xuICAgIGFzdC50YWcudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGFzdCwgYCgke21ha2VUZW1wbGF0ZU9iamVjdFBvbHlmaWxsfShgKTtcbiAgICBjdHgucHJpbnQoYXN0LCBgWyR7ZWxlbWVudHMubWFwKChwYXJ0KSA9PiBlc2NhcGVJZGVudGlmaWVyKHBhcnQudGV4dCwgZmFsc2UpKS5qb2luKCcsICcpfV0sIGApO1xuICAgIGN0eC5wcmludChcbiAgICAgIGFzdCxcbiAgICAgIGBbJHtlbGVtZW50cy5tYXAoKHBhcnQpID0+IGVzY2FwZUlkZW50aWZpZXIocGFydC5yYXdUZXh0LCBmYWxzZSkpLmpvaW4oJywgJyl9XSlgLFxuICAgICk7XG4gICAgYXN0LnRlbXBsYXRlLmV4cHJlc3Npb25zLmZvckVhY2goKGV4cHJlc3Npb24pID0+IHtcbiAgICAgIGN0eC5wcmludChhc3QsICcsICcpO1xuICAgICAgZXhwcmVzc2lvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICB9KTtcbiAgICBjdHgucHJpbnQoYXN0LCAnKScpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIG92ZXJyaWRlIHZpc2l0RnVuY3Rpb25FeHByKGFzdDogby5GdW5jdGlvbkV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHJpbnQoYXN0LCBgZnVuY3Rpb24ke2FzdC5uYW1lID8gJyAnICsgYXN0Lm5hbWUgOiAnJ30oYCk7XG4gICAgdGhpcy5fdmlzaXRQYXJhbXMoYXN0LnBhcmFtcywgY3R4KTtcbiAgICBjdHgucHJpbnRsbihhc3QsIGApIHtgKTtcbiAgICBjdHguaW5jSW5kZW50KCk7XG4gICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoYXN0LnN0YXRlbWVudHMsIGN0eCk7XG4gICAgY3R4LmRlY0luZGVudCgpO1xuICAgIGN0eC5wcmludChhc3QsIGB9YCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgb3ZlcnJpZGUgdmlzaXRBcnJvd0Z1bmN0aW9uRXhwcihhc3Q6IG8uQXJyb3dGdW5jdGlvbkV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHJpbnQoYXN0LCAnKCcpO1xuICAgIHRoaXMuX3Zpc2l0UGFyYW1zKGFzdC5wYXJhbXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGFzdCwgJykgPT4nKTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGFzdC5ib2R5KSkge1xuICAgICAgY3R4LnByaW50bG4oYXN0LCBge2ApO1xuICAgICAgY3R4LmluY0luZGVudCgpO1xuICAgICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoYXN0LmJvZHksIGN0eCk7XG4gICAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgICBjdHgucHJpbnQoYXN0LCBgfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpc09iamVjdExpdGVyYWwgPSBhc3QuYm9keSBpbnN0YW5jZW9mIG8uTGl0ZXJhbE1hcEV4cHI7XG5cbiAgICAgIGlmIChpc09iamVjdExpdGVyYWwpIHtcbiAgICAgICAgY3R4LnByaW50KGFzdCwgJygnKTtcbiAgICAgIH1cblxuICAgICAgYXN0LmJvZHkudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG5cbiAgICAgIGlmIChpc09iamVjdExpdGVyYWwpIHtcbiAgICAgICAgY3R4LnByaW50KGFzdCwgJyknKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBvdmVycmlkZSB2aXNpdERlY2xhcmVGdW5jdGlvblN0bXQoc3RtdDogby5EZWNsYXJlRnVuY3Rpb25TdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnByaW50KHN0bXQsIGBmdW5jdGlvbiAke3N0bXQubmFtZX0oYCk7XG4gICAgdGhpcy5fdmlzaXRQYXJhbXMoc3RtdC5wYXJhbXMsIGN0eCk7XG4gICAgY3R4LnByaW50bG4oc3RtdCwgYCkge2ApO1xuICAgIGN0eC5pbmNJbmRlbnQoKTtcbiAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LnN0YXRlbWVudHMsIGN0eCk7XG4gICAgY3R4LmRlY0luZGVudCgpO1xuICAgIGN0eC5wcmludGxuKHN0bXQsIGB9YCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgb3ZlcnJpZGUgdmlzaXRMb2NhbGl6ZWRTdHJpbmcoYXN0OiBvLkxvY2FsaXplZFN0cmluZywgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIC8vIFRoZSBmb2xsb3dpbmcgY29udm9sdXRlZCBwaWVjZSBvZiBjb2RlIGlzIGVmZmVjdGl2ZWx5IHRoZSBkb3dubGV2ZWxsZWQgZXF1aXZhbGVudCBvZlxuICAgIC8vIGBgYFxuICAgIC8vICRsb2NhbGl6ZSBgLi4uYFxuICAgIC8vIGBgYFxuICAgIC8vIHdoaWNoIGlzIGVmZmVjdGl2ZWx5IGxpa2U6XG4gICAgLy8gYGBgXG4gICAgLy8gJGxvY2FsaXplKF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSwgZXhwcmVzc2lvbjEsIGV4cHJlc3Npb24yLCAuLi4pO1xuICAgIC8vIGBgYFxuICAgIGN0eC5wcmludChhc3QsIGAkbG9jYWxpemUoJHttYWtlVGVtcGxhdGVPYmplY3RQb2x5ZmlsbH0oYCk7XG4gICAgY29uc3QgcGFydHMgPSBbYXN0LnNlcmlhbGl6ZUkxOG5IZWFkKCldO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXN0Lm1lc3NhZ2VQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgcGFydHMucHVzaChhc3Quc2VyaWFsaXplSTE4blRlbXBsYXRlUGFydChpKSk7XG4gICAgfVxuICAgIGN0eC5wcmludChhc3QsIGBbJHtwYXJ0cy5tYXAoKHBhcnQpID0+IGVzY2FwZUlkZW50aWZpZXIocGFydC5jb29rZWQsIGZhbHNlKSkuam9pbignLCAnKX1dLCBgKTtcbiAgICBjdHgucHJpbnQoYXN0LCBgWyR7cGFydHMubWFwKChwYXJ0KSA9PiBlc2NhcGVJZGVudGlmaWVyKHBhcnQucmF3LCBmYWxzZSkpLmpvaW4oJywgJyl9XSlgKTtcbiAgICBhc3QuZXhwcmVzc2lvbnMuZm9yRWFjaCgoZXhwcmVzc2lvbikgPT4ge1xuICAgICAgY3R4LnByaW50KGFzdCwgJywgJyk7XG4gICAgICBleHByZXNzaW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIH0pO1xuICAgIGN0eC5wcmludChhc3QsICcpJyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFBhcmFtcyhwYXJhbXM6IG8uRm5QYXJhbVtdLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IHZvaWQge1xuICAgIHRoaXMudmlzaXRBbGxPYmplY3RzKChwYXJhbSkgPT4gY3R4LnByaW50KG51bGwsIHBhcmFtLm5hbWUpLCBwYXJhbXMsIGN0eCwgJywnKTtcbiAgfVxufVxuIl19