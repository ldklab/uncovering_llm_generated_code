import { SimpleGitTask } from '../types';
import { OutputLogger } from '../git-logger';
import { GitError } from '../api';
declare type AnySimpleGitTask = SimpleGitTask<any>;
declare type TaskInProgress = {
    name: string;
    logger: OutputLogger;
    task: AnySimpleGitTask;
};
export declare class TasksPendingQueue {
    private logLabel;
    private _queue;
    constructor(logLabel?: string);
    private withProgress;
    private createProgress;
    push(task: AnySimpleGitTask): TaskInProgress;
    fatal(err: GitError): void;
    complete(task: AnySimpleGitTask): void;
    attempt(task: AnySimpleGitTask): TaskInProgress;
    static getName(name?: string): string;
    private static counter;
}
export {};
