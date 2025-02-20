"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.possibleElisions = exports.simpleRegularExpression = exports.ADDRESS_BOUNDARY = exports.padGroup = exports.groupPossibilities = void 0;
var v6 = __importStar(require("./constants"));
var sprintf_js_1 = require("sprintf-js");
function groupPossibilities(possibilities) {
    return sprintf_js_1.sprintf('(%s)', possibilities.join('|'));
}
exports.groupPossibilities = groupPossibilities;
function padGroup(group) {
    if (group.length < 4) {
        return sprintf_js_1.sprintf('0{0,%d}%s', 4 - group.length, group);
    }
    return group;
}
exports.padGroup = padGroup;
exports.ADDRESS_BOUNDARY = '[^A-Fa-f0-9:]';
function simpleRegularExpression(groups) {
    var zeroIndexes = [];
    groups.forEach(function (group, i) {
        var groupInteger = parseInt(group, 16);
        if (groupInteger === 0) {
            zeroIndexes.push(i);
        }
    });
    // You can technically elide a single 0, this creates the regular expressions
    // to match that eventuality
    var possibilities = zeroIndexes.map(function (zeroIndex) {
        return groups
            .map(function (group, i) {
            if (i === zeroIndex) {
                var elision = i === 0 || i === v6.GROUPS - 1 ? ':' : '';
                return groupPossibilities([padGroup(group), elision]);
            }
            return padGroup(group);
        })
            .join(':');
    });
    // The simplest case
    possibilities.push(groups.map(padGroup).join(':'));
    return groupPossibilities(possibilities);
}
exports.simpleRegularExpression = simpleRegularExpression;
function possibleElisions(elidedGroups, moreLeft, moreRight) {
    var left = moreLeft ? '' : ':';
    var right = moreRight ? '' : ':';
    var possibilities = [];
    // 1. elision of everything (::)
    if (!moreLeft && !moreRight) {
        possibilities.push('::');
    }
    // 2. complete elision of the middle
    if (moreLeft && moreRight) {
        possibilities.push('');
    }
    if ((moreRight && !moreLeft) || (!moreRight && moreLeft)) {
        // 3. complete elision of one side
        possibilities.push(':');
    }
    // 4. elision from the left side
    possibilities.push(sprintf_js_1.sprintf('%s(:0{1,4}){1,%d}', left, elidedGroups - 1));
    // 5. elision from the right side
    possibilities.push(sprintf_js_1.sprintf('(0{1,4}:){1,%d}%s', elidedGroups - 1, right));
    // 6. no elision
    possibilities.push(sprintf_js_1.sprintf('(0{1,4}:){%d}0{1,4}', elidedGroups - 1));
    // 7. elision (including sloppy elision) from the middle
    for (var groups = 1; groups < elidedGroups - 1; groups++) {
        for (var position = 1; position < elidedGroups - groups; position++) {
            possibilities.push(sprintf_js_1.sprintf('(0{1,4}:){%d}:(0{1,4}:){%d}0{1,4}', position, elidedGroups - position - groups - 1));
        }
    }
    return groupPossibilities(possibilities);
}
exports.possibleElisions = possibleElisions;
//# sourceMappingURL=regular-expressions.js.map