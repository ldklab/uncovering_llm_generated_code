import { Scheduler } from './scheduler';
import { outputHandler, SimpleGitExecutor, SimpleGitTask } from '../types';
export declare class GitExecutorChain implements SimpleGitExecutor {
    private _executor;
    private _scheduler;
    private _chain;
    private _queue;
    get binary(): string;
    get outputHandler(): outputHandler | undefined;
    get cwd(): string;
    get env(): import("../types").GitExecutorEnv;
    constructor(_executor: SimpleGitExecutor, _scheduler: Scheduler);
    push<R>(task: SimpleGitTask<R>): Promise<void | R>;
    private attemptTask;
    private onFatalException;
    private attemptRemoteTask;
    private attemptEmptyTask;
    private handleTaskData;
    private gitResponse;
}
