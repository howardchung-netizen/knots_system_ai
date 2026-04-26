import AsyncHelper from '../../Core/helper/AsyncHelper.js';
import DH from '../../Core/helper/DateHelper.js';
import RandomGenerator from '../../Core/helper/util/RandomGenerator.js';

/**
 * @module Gantt/util/ProjectGenerator
 */

const
    year                = new Date().getFullYear(),
    earlyMondayThisYear = DH.add(DH.startOf(new Date(year, 0, 5), 'week'), 1 - DH.weekStartDay, 'day'),
    rnd                 = new RandomGenerator();

function getNum(id, token) {
    return parseInt('' + id + token);
}

/**
 * An internal utility class which generates sample project data for Examples and Tests.
 */

export default class ProjectGenerator {
    static async generateAsync(requestedTaskCount, maxProjectSize, progressCallback = null, startDate = earlyMondayThisYear, log = true) {
        const
            config = {
                startDate,
                tasksData        : [],
                dependenciesData : []
            },
            blockCount = Math.ceil(requestedTaskCount / 10),
            projectSize = Math.ceil(maxProjectSize / 10),
            generator = this.generateBlocks(blockCount, projectSize, config.startDate);

        let count = 0,
            duration = 0,
            taskCount = 0,
            dependencyCount = 0;

        log && console.time('generate');

        for (const block of generator) {
            config.tasksData.push(...block.tasksData);
            config.dependenciesData.push(...block.dependenciesData);

            if (block.projectDuration) {
                duration = Math.max(block.projectDuration, duration);
            }

            taskCount += block.taskCount;
            dependencyCount += block.dependencyCount;

            if (++count % 1000 === 0) {
                progressCallback?.(taskCount, dependencyCount, false);
                await AsyncHelper.animationFrame();
            }
        }

        progressCallback?.(taskCount, dependencyCount, true);

        config.endDate = DH.add(config.startDate, Math.max(duration, 30), 'days');

        log && console.timeEnd('generate');

        return config;
    }

    static * generateBlocks(count, projectSize, startDate) {
        let currentId        = 1,
            dependencyId     = 1,
            projectDuration  = 0,
            blockDuration    = 0,
            sumDuration      = 0,
            currentDuration  = 0,
            currentStartDate = startDate,
            finishedDuration = 0;

        function rndDuration(addToTotal = true, resetSum = false) {
            const value = rnd.nextRandom(5) + 2;

            if (addToTotal) {
                blockDuration += value;
            }

            if (resetSum) {
                sumDuration = 0;
            }

            sumDuration += value;
            currentDuration = value;

            return value;
        }

        function nextStartDate(offset = currentDuration) {
            currentStartDate = DH.add(currentStartDate, offset, 'days');
            return currentStartDate;
        }

        function calculateEndDate() {
            return DH.add(currentStartDate, currentDuration, 'days');
        }

        function storePercentDone(children) {
            finishedDuration = 0;

            for (const task of children) {
                finishedDuration += task.duration * task.percentDone;
            }

            return children;
        }

        for (let i = 0; i < count; i++) {
            const
                blockStartId = currentId,
                block = {
                    tasksData : [
                        {
                            id        : currentId++,
                            name      : 'Parent ' + blockStartId,
                            startDate : nextStartDate(i > 0 ? currentDuration : 0),
                            expanded  : true,
                            inactive  : false,
                            children  : [
                                {
                                    id        : currentId++,
                                    name      : 'Sub-parent ' + getNum(blockStartId, 1),
                                    startDate : nextStartDate(0),
                                    expanded  : true,
                                    inactive  : false,
                                    children  : storePercentDone([
                                        {
                                            id          : currentId++,
                                            name        : 'Task ' + getNum(blockStartId, 11),
                                            startDate   : nextStartDate(0),
                                            duration    : rndDuration(true, true),
                                            effort      : currentDuration,
                                            effortUnit  : 'day',
                                            endDate     : calculateEndDate(),
                                            percentDone : rnd.nextRandom(100),
                                            inactive    : false
                                        },
                                        {
                                            id          : currentId++,
                                            name        : 'Task ' + getNum(blockStartId, 12),
                                            startDate   : nextStartDate(),
                                            duration    : rndDuration(),
                                            effort      : currentDuration,
                                            effortUnit  : 'day',
                                            endDate     : calculateEndDate(),
                                            percentDone : rnd.nextRandom(100),
                                            inactive    : false
                                        },
                                        {
                                            id          : currentId++,
                                            name        : 'Task ' + getNum(blockStartId, 13),
                                            startDate   : nextStartDate(),
                                            duration    : rndDuration(),
                                            effort      : currentDuration,
                                            effortUnit  : 'day',
                                            endDate     : calculateEndDate(),
                                            percentDone : rnd.nextRandom(100),
                                            inactive    : false
                                        },
                                        {
                                            id          : currentId++,
                                            name        : 'Task ' + getNum(blockStartId, 14),
                                            startDate   : nextStartDate(),
                                            duration    : rndDuration(),
                                            effort      : currentDuration,
                                            effortUnit  : 'day',
                                            endDate     : calculateEndDate(),
                                            percentDone : rnd.nextRandom(100),
                                            inactive    : false
                                        }
                                    ]),
                                    duration    : sumDuration,
                                    effort      : sumDuration,
                                    effortUnit  : 'day',
                                    percentDone : finishedDuration / sumDuration,
                                    endDate     : calculateEndDate()
                                },
                                {
                                    id        : currentId++,
                                    name      : 'Sub-parent ' + getNum(blockStartId, 2),
                                    startDate : nextStartDate(),
                                    expanded  : true,
                                    inactive  : false,
                                    children  : storePercentDone([
                                        {
                                            id          : currentId++,
                                            name        : 'Task ' + getNum(blockStartId, 21),
                                            startDate   : nextStartDate(0),
                                            duration    : rndDuration(true, true),
                                            effort      : currentDuration,
                                            effortUnit  : 'day',
                                            endDate     : calculateEndDate(),
                                            percentDone : rnd.nextRandom(100),
                                            inactive    : false
                                        },
                                        {
                                            id          : currentId++,
                                            name        : 'Task ' + getNum(blockStartId, 22),
                                            startDate   : nextStartDate(),
                                            duration    : rndDuration(),
                                            effort      : currentDuration,
                                            effortUnit  : 'day',
                                            endDate     : calculateEndDate(),
                                            percentDone : rnd.nextRandom(100),
                                            inactive    : false
                                        },
                                        {
                                            id          : currentId++,
                                            name        : 'Task ' + getNum(blockStartId, 23),
                                            startDate   : nextStartDate(),
                                            duration    : rndDuration(),
                                            effort      : currentDuration,
                                            effortUnit  : 'day',
                                            endDate     : calculateEndDate(),
                                            percentDone : rnd.nextRandom(100),
                                            inactive    : false
                                        }
                                    ]),
                                    duration    : sumDuration,
                                    effort      : sumDuration,
                                    effortUnit  : 'day',
                                    percentDone : finishedDuration / sumDuration,
                                    endDate     : calculateEndDate()
                                }
                            ],
                            duration   : blockDuration,
                            effort     : blockDuration,
                            effortUnit : 'day',
                            endDate    : calculateEndDate()
                        }
                    ],

                    dependenciesData : [
                        { id : dependencyId++, fromEvent : blockStartId + 2, toEvent : blockStartId + 3 },
                        { id : dependencyId++, fromEvent : blockStartId + 3, toEvent : blockStartId + 4 },
                        { id : dependencyId++, fromEvent : blockStartId + 4, toEvent : blockStartId + 5 },
                        { id : dependencyId++, fromEvent : blockStartId + 5, toEvent : blockStartId + 7 },
                        { id : dependencyId++, fromEvent : blockStartId + 7, toEvent : blockStartId + 8 },
                        { id : dependencyId++, fromEvent : blockStartId + 8, toEvent : blockStartId + 9 }
                    ],

                    taskCount       : 10,
                    dependencyCount : 5
                };

            const
                parent     = block.tasksData[0],
                subParent1 = parent.children[0],
                subParent2 = parent.children[1];

            parent.percentDone = (subParent1.duration * subParent1.percentDone + subParent2.duration * subParent2.percentDone) / parent.duration;

            projectDuration += blockDuration;
            blockDuration = 0;
            block.projectDuration = projectDuration;

            if (i % projectSize !== 0) {
                block.dependenciesData.push({
                    id        : dependencyId++,
                    fromEvent : blockStartId - 2,
                    toEvent   : blockStartId + 2,
                    type      : 2,
                    lag       : 0,
                    lagUnit   : 'd'
                });
                block.dependencyCount++;
            }
            else {
                projectDuration = 0;
            }

            currentId++;

            yield block;
        }
    }
}
