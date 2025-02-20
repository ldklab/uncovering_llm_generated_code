import { __extends } from "tslib";
import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function groupBy(keySelector, elementSelector, durationSelector, subjectSelector) {
    return operate(function (source, subscriber) {
        var groups = new Map();
        var notify = function (cb) {
            groups.forEach(cb);
            cb(subscriber);
        };
        var handleError = function (err) { return notify(function (consumer) { return consumer.error(err); }); };
        var groupBySourceSubscriber = new GroupBySubscriber(subscriber, function (value) {
            try {
                var key_1 = keySelector(value);
                var group_1 = groups.get(key_1);
                if (!group_1) {
                    groups.set(key_1, (group_1 = subjectSelector ? subjectSelector() : new Subject()));
                    var grouped = createGroupedObservable(key_1, group_1);
                    subscriber.next(grouped);
                    if (durationSelector) {
                        var durationSubscriber_1 = new OperatorSubscriber(group_1, function () {
                            group_1.complete();
                            durationSubscriber_1 === null || durationSubscriber_1 === void 0 ? void 0 : durationSubscriber_1.unsubscribe();
                        }, undefined, undefined, function () { return groups.delete(key_1); });
                        groupBySourceSubscriber.add(durationSelector(grouped).subscribe(durationSubscriber_1));
                    }
                }
                group_1.next(elementSelector ? elementSelector(value) : value);
            }
            catch (err) {
                handleError(err);
            }
        }, handleError, function () { return notify(function (consumer) { return consumer.complete(); }); }, function () { return groups.clear(); });
        source.subscribe(groupBySourceSubscriber);
        function createGroupedObservable(key, groupSubject) {
            var result = new Observable(function (groupSubscriber) {
                groupBySourceSubscriber.activeGroups++;
                var innerSub = groupSubject.subscribe(groupSubscriber);
                return function () {
                    innerSub.unsubscribe();
                    --groupBySourceSubscriber.activeGroups === 0 &&
                        groupBySourceSubscriber.teardownAttempted &&
                        groupBySourceSubscriber.unsubscribe();
                };
            });
            result.key = key;
            return result;
        }
    });
}
var GroupBySubscriber = (function (_super) {
    __extends(GroupBySubscriber, _super);
    function GroupBySubscriber() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.activeGroups = 0;
        _this.teardownAttempted = false;
        return _this;
    }
    GroupBySubscriber.prototype.unsubscribe = function () {
        this.teardownAttempted = true;
        this.activeGroups === 0 && _super.prototype.unsubscribe.call(this);
    };
    return GroupBySubscriber;
}(OperatorSubscriber));
//# sourceMappingURL=groupBy.js.map