/**
 * Node.js only.
 */
export declare class CmdSet {
    fullCmd: string;
    cwd: string;
    title: string;
    listeners: {
        [name: string]: Function | undefined;
    };
}
declare class CmdUtil {
    verbal: boolean;
    printStderr: boolean;
    exec(cmdList: string | string[], cwd?: string, title?: string, callbacks?: {
        [name: string]: Function | undefined;
    }): Promise<any>;
    parseCmd(fullCmd: string): [string, string[]];
    serial(cmds: any[]): Promise<any>;
    /**
     *
     * Run a list of commands in sequence.
     *
     * @param cmdList
     * @param cwd
     * @param options
     *
     * @returns Promise<number> the exit code of the last command
     */
    runCmdList(cmdList: string[], cwd?: string, options?: {
        [name: string]: any;
    }): Promise<number>;
    /**
     *
     * Run a single command.
     *
     * @param fullCmd<string> a full command string, e.g. "ls -al"
     * @param cwd<optional string> current working directory
     * @param options<optional object> options
     *
     * @param options.verbal<optional boolean> if true, output the command execution details
     * @param options.fake<optional boolean> if true, fake the command execution
     *
     * @param options.callbacks<optional object> callbacks
     * @param options.callbacks.onStdout<optional function> callback function for stdout
     * @param options.callbacks.onStderr<optional function> callback function for stderr
     * @param options.callbacks.onError<optional function> callback function for error
     * @param options.callbacks.onClose<optional function> callback function for close
     *
     * @returns Promise<number> the exit code of the command
     */
    runCmd(fullCmd: string, cwd?: string, options?: {
        [name: string]: any;
    }): Promise<number>;
}
declare const cmdUtil: CmdUtil;
export default cmdUtil;
