"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitExecutorChain = void 0;
const child_process_1 = require("child_process");
const api_1 = require("../api");
const task_1 = require("../tasks/task");
const tasks_pending_queue_1 = require("./tasks-pending-queue");
const utils_1 = require("../utils");
class GitExecutorChain {
    constructor(_executor, _scheduler) {
        this._executor = _executor;
        this._scheduler = _scheduler;
        this._chain = Promise.resolve();
        this._queue = new tasks_pending_queue_1.TasksPendingQueue();
    }
    get binary() {
        return this._executor.binary;
    }
    get outputHandler() {
        return this._executor.outputHandler;
    }
    get cwd() {
        return this._executor.cwd;
    }
    get env() {
        return this._executor.env;
    }
    push(task) {
        this._queue.push(task);
        return this._chain = this._chain.then(() => this.attemptTask(task));
    }
    attemptTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            const onScheduleComplete = yield this._scheduler.next();
            const onQueueComplete = () => this._queue.complete(task);
            try {
                const { logger } = this._queue.attempt(task);
                return yield (task_1.isEmptyTask(task)
                    ? this.attemptEmptyTask(task, logger)
                    : this.attemptRemoteTask(task, logger));
            }
            catch (e) {
                throw this.onFatalException(task, e);
            }
            finally {
                onQueueComplete();
                onScheduleComplete();
            }
        });
    }
    onFatalException(task, e) {
        const gitError = (e instanceof api_1.GitError) ? Object.assign(e, { task }) : new api_1.GitError(task, e && String(e));
        this._chain = Promise.resolve();
        this._queue.fatal(gitError);
        return gitError;
    }
    attemptRemoteTask(task, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const raw = yield this.gitResponse(this.binary, task.commands, this.outputHandler, logger.step('SPAWN'));
            const outputStreams = yield this.handleTaskData(task, raw, logger.step('HANDLE'));
            logger(`passing response to task's parser as a %s`, task.format);
            if (task_1.isBufferTask(task)) {
                return utils_1.callTaskParser(task.parser, outputStreams);
            }
            return utils_1.callTaskParser(task.parser, outputStreams.asStrings());
        });
    }
    attemptEmptyTask(task, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            logger(`empty task bypassing child process to call to task's parser`);
            return task.parser();
        });
    }
    handleTaskData({ onError, concatStdErr }, { exitCode, stdOut, stdErr }, logger) {
        return new Promise((done, fail) => {
            logger(`Preparing to handle process response exitCode=%d stdOut=`, exitCode);
            if (exitCode && stdErr.length && onError) {
                logger.info(`exitCode=%s handling with custom error handler`);
                logger(`concatenate stdErr to stdOut: %j`, concatStdErr);
                return onError(exitCode, Buffer.concat([...(concatStdErr ? stdOut : []), ...stdErr]).toString('utf-8'), (result) => {
                    logger.info(`custom error handler treated as success`);
                    logger(`custom error returned a %s`, utils_1.objectToString(result));
                    done(new utils_1.GitOutputStreams(Buffer.isBuffer(result) ? result : Buffer.from(String(result)), Buffer.concat(stdErr)));
                }, fail);
            }
            if (exitCode && stdErr.length) {
                logger.info(`exitCode=%s treated as error when then child process has written to stdErr`);
                return fail(Buffer.concat(stdErr).toString('utf-8'));
            }
            if (concatStdErr) {
                logger(`concatenating stdErr onto stdOut before processing`);
                logger(`stdErr: $O`, stdErr);
                stdOut.push(...stdErr);
            }
            logger.info(`retrieving task output complete`);
            done(new utils_1.GitOutputStreams(Buffer.concat(stdOut), Buffer.concat(stdErr)));
        });
    }
    gitResponse(command, args, outputHandler, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const outputLogger = logger.sibling('output');
            const spawnOptions = {
                cwd: this.cwd,
                env: this.env,
                windowsHide: true,
            };
            return new Promise((done) => {
                const stdOut = [];
                const stdErr = [];
                let attempted = false;
                function attemptClose(exitCode, event = 'retry') {
                    // closing when there is content, terminate immediately
                    if (attempted || stdErr.length || stdOut.length) {
                        logger.info(`exitCode=%s event=%s`, exitCode, event);
                        done({
                            stdOut,
                            stdErr,
                            exitCode,
                        });
                        attempted = true;
                        outputLogger.destroy();
                    }
                    // first attempt at closing but no content yet, wait briefly for the close/exit that may follow
                    if (!attempted) {
                        attempted = true;
                        setTimeout(() => attemptClose(exitCode, 'deferred'), 50);
                        logger('received %s event before content on stdOut/stdErr', event);
                    }
                }
                logger.info(`%s %o`, command, args);
                logger('%O', spawnOptions);
                const spawned = child_process_1.spawn(command, args, spawnOptions);
                spawned.stdout.on('data', onDataReceived(stdOut, 'stdOut', logger, outputLogger.step('stdOut')));
                spawned.stderr.on('data', onDataReceived(stdErr, 'stdErr', logger, outputLogger.step('stdErr')));
                spawned.on('error', onErrorReceived(stdErr, logger));
                spawned.on('close', (code) => attemptClose(code, 'close'));
                spawned.on('exit', (code) => attemptClose(code, 'exit'));
                if (outputHandler) {
                    logger(`Passing child process stdOut/stdErr to custom outputHandler`);
                    outputHandler(command, spawned.stdout, spawned.stderr, [...args]);
                }
            });
        });
    }
}
exports.GitExecutorChain = GitExecutorChain;
function onErrorReceived(target, logger) {
    return (err) => {
        logger(`[ERROR] child process exception %o`, err);
        target.push(Buffer.from(String(err.stack), 'ascii'));
    };
}
function onDataReceived(target, name, logger, output) {
    return (buffer) => {
        logger(`%s received %L bytes`, name, buffer);
        output(`%B`, buffer);
        target.push(buffer);
    };
}
//# sourceMappingURL=git-executor-chain.js.map