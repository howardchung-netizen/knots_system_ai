import { ChronoIterator } from "../../../../ChronoGraph/chrono/Graph.js"
import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { calculate, field } from "../../../../ChronoGraph/replica/Entity.js"
import { HasChildrenMixin } from "../scheduler_basic/HasChildrenMixin.js"
import { SchedulerProDependencyMixin } from "../scheduler_pro/SchedulerProDependencyMixin.js"
import { ScheduledByDependenciesLateEventMixin } from "./ScheduledByDependenciesLateEventMixin.js"
import { InactiveEventMixin } from "./InactiveEventMixin.js"


/**
 * Critical path entry.
 */
export type CriticalPathNode = {
    /**
     * Critical event.
     */
    event       : ScheduledByDependenciesLateEventMixin,
    /**
     * Dependency leading to the next path entry.
     * Omitted for the last entry.
     */
    dependency? : SchedulerProDependencyMixin
}

/**
 * Project _critical path_.
 */
export type CriticalPath = CriticalPathNode[]


/**
 * This is a mixin, adding critical path calculation to the event node.
 *
 * Scheduling-wise it adds *criticalPaths* field to an entity mixing it.
 *
 * For more details on the _critical path method_ please check this article: https://en.wikipedia.org/wiki/Critical_path_method
 */
export class HasCriticalPathsMixin extends Mixin(
    [ HasChildrenMixin ],
    (base : AnyConstructor<HasChildrenMixin, typeof HasChildrenMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class HasCriticalPathsMixin extends base {

        /**
         * The array of the _critical paths_.
         * Each critical path in turn is represented as an array of [[CriticalPathNode]] entries.
         */
        @field({ lazy : true })
        criticalPaths             : CriticalPath[]


        @calculate('criticalPaths')
        * calculateCriticalPaths () : ChronoIterator<CriticalPath[]> {
            const
                paths : CriticalPath[]                                      = [],
                pathsToProcess : CriticalPath[]                             = [],
                events : Set<InactiveEventMixin>                            = yield this.$.childEvents,
                eventsToProcess : InactiveEventMixin[]                      = [...events],
                projectEndDate : Date                                       = yield this.$.endDate

            // First collect events we'll start collecting paths from.
            // We need to start from critical events w/o incoming dependencies
            let event : InactiveEventMixin

            while ((event = eventsToProcess.shift())) {
                const
                    childEvents : Set<InactiveEventMixin>                       = yield event.$.childEvents,
                    eventIsCritical : boolean                                   = yield event.$.critical,
                    eventIsActive : boolean                                     = !(yield event.$.inactive),
                    eventEndDate : Date                                         = yield event.$.endDate

                // register a new path finishing at the event
                if (eventIsActive && eventEndDate && eventEndDate.getTime() - projectEndDate.getTime() === 0 && eventIsCritical) {
                    pathsToProcess.push([{ event }])
                }

                eventsToProcess.push(...childEvents)
            }

            let path : CriticalPath

            // fetch paths one by one and process
            while ((path = pathsToProcess.shift())) {
                let taskIndex : number = path.length - 1,
                    node : CriticalPathNode

                // get the path last event
                while ((node = path[taskIndex])) {

                    const criticalPredecessorNodes : CriticalPathNode[] = []

                    // collect critical successors
                    for (const dependency of (yield node.event.$.incomingDeps)) {
                        const event : InactiveEventMixin                        = yield dependency.$.fromEvent

                        // if we found a critical predecessor
                        if (event && (yield dependency.$.active) && !(yield event.$.inactive) && (yield event.$.critical)) {
                            criticalPredecessorNodes.push({ event, dependency })
                        }
                    }

                    // if critical predecessor(s) found
                    if (criticalPredecessorNodes.length) {
                        // make a copy of the path leading part
                        const pathCopy = path.slice()

                        // append the found predecessor to the path
                        path.push(criticalPredecessorNodes[0])

                        // if we found more than one predecessor we start new path as: leading path + predecessor
                        for (let i = 1; i < criticalPredecessorNodes.length; i++) {
                            pathsToProcess.push(pathCopy.concat(criticalPredecessorNodes[i]))
                        }

                        // increment counter to process the predecessor we've appended to the path
                        taskIndex++
                    }
                    else {
                        // no predecessors -> stop the loop
                        taskIndex = -1
                    }
                }

                // we collected the path backwards so let's reverse it
                paths.push(path.reverse())
            }

            return paths
        }
    }

    return HasCriticalPathsMixin
}){}
