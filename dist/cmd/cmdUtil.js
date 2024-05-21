import { spawn } from "child_process";
import out from "./out";
import { timeUtil } from "@btang/ts-lib";
/**
 * Node.js only.
 */
export class CmdSet {
    fullCmd = "";
    cwd = "";
    title = "";
    listeners = {
        onStdout: undefined,
        onStderr: undefined,
        onError: undefined,
    };
}
class CmdUtil {
    verbal = false;
    printStderr = false;
    exec(cmdList, cwd, title, callbacks) {
        const startTime = new Date().getTime();
        callbacks = callbacks || {};
        const originalOnClose = callbacks.onClose || undefined;
        callbacks.onClose = (code) => {
            if (this.verbal)
                out.line("[SPAWN Close]: " + code);
            if (code === 0) {
                // end without error.
                if (!this.verbal) {
                    const endTime = new Date().getTime(), durStr = timeUtil.formatDuring(endTime - startTime), duration = `[${durStr}]`;
                    out.stopSpinner();
                    out.prefix(out.successMark);
                    out.append(duration, true);
                }
            }
            else {
                // end with error.
                if (!this.verbal) {
                    out.stopSpinner();
                    out.prefix(out.failedMark, true);
                }
            }
            originalOnClose?.call(null, code);
        };
        if (title) {
            out.line("   " + title, true, false);
            if (!this.verbal)
                out.startSpinner(true);
        }
        if (typeof cmdList === "string")
            cmdList = [cmdList];
        if (this.verbal) {
            out.line("[yellow][SPAWN]:[/yellow] " + cmdList);
        }
        return this.runCmdList(cmdList, cwd, callbacks);
    }
    parseCmd(fullCmd) {
        const input = fullCmd
            .split(" ")
            .map((s) => String(s || "").trim())
            .filter((s) => s), cmd = input[0], args = input.slice(1);
        return [cmd, args];
    }
    serial(cmds) {
        let result = Promise.resolve();
        cmds.forEach((d) => {
            result = result.then(() => this.exec(d[0], d[1], d[2], d[3]));
        });
        return result;
    }
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
    runCmdList(cmdList, cwd, options) {
        let result = Promise.resolve(0);
        cmdList.forEach((cmd) => {
            result = result.then(() => this.runCmd(cmd, cwd, options));
        });
        return result;
    }
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
    runCmd(fullCmd, cwd, options) {
        const [cmd, argv] = this.parseCmd(fullCmd);
        return new Promise((resolve, reject) => {
            if (options?.fake) {
                setTimeout(() => {
                    options?.callbacks?.onClose?.call(null, 0);
                    resolve(0);
                }, Math.random() * 5000 + 2000);
                return;
            }
            const proc = spawn(cmd, argv, cwd ? { cwd } : undefined);
            proc.stdout.on("data", (data) => {
                if (options?.verbal)
                    out.line(data, false, false);
                options?.callbacks?.onStdout?.call(null, data.toString());
            });
            proc.stderr.on("data", (data) => {
                if (this.printStderr)
                    out.line("[red]stderr:[/red] " + data, false, false);
                options?.callbacks?.onStderr?.call(null, data.toString());
            });
            proc.on("error", (err) => options?.callbacks?.onError?.call(null, err));
            proc.on("close", (code) => {
                options?.callbacks?.onClose?.call(null, code);
                if (code === 0)
                    resolve(code);
                else
                    reject(code);
            });
        });
    }
}
const cmdUtil = new CmdUtil();
export default cmdUtil;
