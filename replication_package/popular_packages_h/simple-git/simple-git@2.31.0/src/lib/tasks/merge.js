"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeTask = void 0;
const api_1 = require("../api");
const parse_merge_1 = require("../parsers/parse-merge");
const task_1 = require("./task");
function mergeTask(customArgs) {
    if (!customArgs.length) {
        return task_1.configurationErrorTask('Git.merge requires at least one option');
    }
    return {
        commands: ['merge', ...customArgs],
        format: 'utf-8',
        parser(stdOut, stdErr) {
            const merge = parse_merge_1.parseMergeResult(stdOut, stdErr);
            if (merge.failed) {
                throw new api_1.GitResponseError(merge);
            }
            return merge;
        }
    };
}
exports.mergeTask = mergeTask;
//# sourceMappingURL=merge.js.map