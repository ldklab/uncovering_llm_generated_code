(function(exports) {
    'use strict';

    const Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        // ... (other syntax types)
        YieldExpression: 'YieldExpression'
    };

    const VisitorOption = {
        Break: {},
        Skip: {},
        Remove: {}
    };

    const VisitorKeys = {
        AssignmentExpression: ['left', 'right'],
        // ... (other visitor keys)
        YieldExpression: ['argument']
    };

    function deepCopy(obj) {
        let copy = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let val = obj[key];
                copy[key] = (typeof val === 'object' && val !== null) ? deepCopy(val) : val;
            }
        }
        return copy;
    }
    
    function upperBound(array, func) {
        let len = array.length;
        let mid, start = 0;
        while (len) {
            mid = len >>> 1;
            if (func(array[start + mid])) len = mid;
            else { start += mid + 1; len -= mid + 1; }
        }
        return start;
    }

    function Controller() {}

    Controller.prototype.traverse = function(root, visitor) {
        // Traverse logic...
    };

    Controller.prototype.replace = function(root, visitor) {
        // Replace logic...
    };

    function traverse(root, visitor) {
        let controller = new Controller();
        return controller.traverse(root, visitor);
    }

    function replace(root, visitor) {
        let controller = new Controller();
        return controller.replace(root, visitor);
    }

    function extendCommentRange(comment, tokens) {
        let target = upperBound(tokens, token => token.range[0] > comment.range[0]);
        comment.extendedRange = [comment.range[0], comment.range[1]];

        if (target !== tokens.length) {
            comment.extendedRange[1] = tokens[target].range[0];
        }
        if (target > 0) {
            comment.extendedRange[0] = tokens[target - 1].range[1];
        }

        return comment;
    }

    function attachComments(tree, providedComments, tokens) {
        if (!tree.range) throw new Error('attachComments needs range information');

        let comments = providedComments.map(comment => extendCommentRange(deepCopy(comment), tokens));

        traverse(tree, {
            enter(node) {
                while (comments.length && comments[0].extendedRange[1] <= node.range[0]) {
                    let comment = comments.shift();
                    if (comment.extendedRange[1] === node.range[0]) {
                        node.leadingComments = node.leadingComments || [];
                        node.leadingComments.push(comment);
                    }
                }
                if (comments.length && comments[0].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            },
            leave(node) {
                while (comments.length && node.range[1] >= comments[0].extendedRange[0]) {
                    let comment = comments.shift();
                    if (node.range[1] === comment.extendedRange[0]) {
                        node.trailingComments = node.trailingComments || [];
                        node.trailingComments.push(comment);
                    }
                }
                if (comments.length && comments[0].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        return tree;
    }

    exports.Syntax = Syntax;
    exports.traverse = traverse;
    exports.replace = replace;
    exports.attachComments = attachComments;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
    exports.Controller = Controller;
    exports.cloneEnvironment = () => (function(exports) { return {}; })();

})(typeof exports === 'undefined' ? this['astUtils'] = {} : exports);
