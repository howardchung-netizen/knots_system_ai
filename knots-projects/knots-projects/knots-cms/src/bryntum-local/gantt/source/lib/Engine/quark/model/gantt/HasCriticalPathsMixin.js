var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { calculate, field } from "../../../../ChronoGraph/replica/Entity.js";
import { HasChildrenMixin } from "../scheduler_basic/HasChildrenMixin.js";
/**
 * This is a mixin, adding critical path calculation to the event node.
 *
 * Scheduling-wise it adds *criticalPaths* field to an entity mixing it.
 *
 * For more details on the _critical path method_ please check this article: https://en.wikipedia.org/wiki/Critical_path_method
 */
export class HasCriticalPathsMixin extends Mixin([HasChildrenMixin], (base) => {
    const superProto = base.prototype;
    class HasCriticalPathsMixin extends base {
        *calculateCriticalPaths() {
            const paths = [], pathsToProcess = [], events = yield this.$.childEvents, eventsToProcess = [...events], projectEndDate = yield this.$.endDate;
            // First collect events we'll start collecting paths from.
            // We need to start from critical events w/o incoming dependencies
            let event;
            while ((event = eventsToProcess.shift())) {
                const childEvents = yield event.$.childEvents, eventIsCritical = yield event.$.critical, eventIsActive = !(yield event.$.inactive), eventEndDate = yield event.$.endDate;
                // register a new path finishing at the event
                if (eventIsActive && eventEndDate && eventEndDate.getTime() - projectEndDate.getTime() === 0 && eventIsCritical) {
                    pathsToProcess.push([{ event }]);
                }
                eventsToProcess.push(...childEvents);
            }
            let path;
            // fetch paths one by one and process
            while ((path = pathsToProcess.shift())) {
                let taskIndex = path.length - 1, node;
                // get the path last event
                while ((node = path[taskIndex])) {
                    const criticalPredecessorNodes = [];
                    // collect critical successors
                    for (const dependency of (yield node.event.$.incomingDeps)) {
                        const event = yield dependency.$.fromEvent;
                        // if we found a critical predecessor
                        if (event && (yield dependency.$.active) && !(yield event.$.inactive) && (yield event.$.critical)) {
                            criticalPredecessorNodes.push({ event, dependency });
                        }
                    }
                    // if critical predecessor(s) found
                    if (criticalPredecessorNodes.length) {
                        // make a copy of the path leading part
                        const pathCopy = path.slice();
                        // append the found predecessor to the path
                        path.push(criticalPredecessorNodes[0]);
                        // if we found more than one predecessor we start new path as: leading path + predecessor
                        for (let i = 1; i < criticalPredecessorNodes.length; i++) {
                            pathsToProcess.push(pathCopy.concat(criticalPredecessorNodes[i]));
                        }
                        // increment counter to process the predecessor we've appended to the path
                        taskIndex++;
                    }
                    else {
                        // no predecessors -> stop the loop
                        taskIndex = -1;
                    }
                }
                // we collected the path backwards so let's reverse it
                paths.push(path.reverse());
            }
            return paths;
        }
    }
    __decorate([
        field({ lazy: true })
    ], HasCriticalPathsMixin.prototype, "criticalPaths", void 0);
    __decorate([
        calculate('criticalPaths')
    ], HasCriticalPathsMixin.prototype, "calculateCriticalPaths", null);
    return HasCriticalPathsMixin;
}) {
}
