import { Model, timeUtil } from "@btang/ts-lib";
import cmdUtil from "./cmdUtil";
import confParser from "./confParser";
import out from "./out";
export default class CmdRunner extends Model {
    _data;
    constructor(data) {
        super();
        this._data = data?.$CLASS$ === "CmdData" ? data : new CmdData(data);
    }
    trace() {
        console.debug(this._data);
    }
    run(options) {
        options = options || {};
        options.fake = true;
        return this._data?.run(options) || Promise.reject("No commands to run");
    }
}
class CmdData {
    title = "";
    cwd = "";
    cmdSetList = [];
    displayTotalTime = false;
    get $CLASS$() {
        return "CmdData";
    }
    constructor(data) {
        this.title = confParser.assemble(data?.title || "");
        this.cwd = confParser.assemble(data?.cwd || "");
        this.cmdSetList = (data?.cmdSetList || []).map((s) => new CmdSet(s, this.cwd));
        this.displayTotalTime = !!data?.displayTotalTime;
    }
    run(options) {
        const startTime = new Date().getTime();
        if (this.title) {
            out.header(this.title
                .split("\n")
                .map((l) => l.trim())
                .filter((l) => l.length > 0));
        }
        return this._runAllCmdSets(options).then((code) => {
            if (this.displayTotalTime) {
                const dur = timeUtil.formatDuring(new Date().getTime() - startTime);
                out.line(`Completed in [green]${dur}[/green]`, false, true);
            }
            return code;
        });
    }
    _runAllCmdSets(options) {
        let result = Promise.resolve(0);
        this.cmdSetList.forEach((cmdSet) => {
            result = result.then(() => cmdSet.run(options));
        });
        return result;
    }
}
class CmdSet {
    cmdList = [];
    cwd = "";
    title = "";
    constructor(data, cmdCwd) {
        this.cwd = confParser.assemble(data?.cwd) || cmdCwd || "";
        this.title = confParser.assemble(data?.title || "");
        const cmd = data?.cmd;
        if (cmd instanceof Array)
            this.cmdList = cmd;
        else if (typeof data?.cmd === "string")
            this.cmdList = [cmd];
        else
            this.cmdList = [];
        this.cmdList = this.cmdList.map((c) => confParser.assemble(c));
    }
    run(options) {
        const startTime = new Date().getTime();
        if (this.title) {
            out.line("   " + this.title, true, false);
            if (!options?.verbal)
                out.startSpinner(true);
        }
        if (options?.verbal) {
            out.line("[yellow][SPAWN]:[/yellow] " + this.cmdList.join("; "));
        }
        return cmdUtil.runCmdList(this.cmdList, this.cwd, options).then((code) => {
            if (code === 0) {
                // end without error.
                if (!options.verbal) {
                    const endTime = new Date().getTime(), durStr = timeUtil.formatDuring(endTime - startTime), duration = `[${durStr}]`;
                    out.stopSpinner();
                    out.prefix(out.successMark);
                    out.append(duration, true);
                }
            }
            else {
                // end with error.
                if (!options.verbal) {
                    out.stopSpinner();
                    out.prefix(out.failedMark, true);
                }
            }
            return code;
        });
    }
}
