import { GitExecutorEnv, outputHandler, SimpleGitExecutor, SimpleGitTask } from '../types';
import { Scheduler } from './scheduler';
export declare class GitExecutor implements SimpleGitExecutor {
    binary: string;
    cwd: string;
    private _scheduler;
    private _chain;
    env: GitExecutorEnv;
    outputHandler?: outputHandler;
    constructor(binary: string, cwd: string, _scheduler: Scheduler);
    chain(): SimpleGitExecutor;
    push<R>(task: SimpleGitTask<R>): Promise<void | R>;
}
