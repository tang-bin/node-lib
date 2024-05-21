import { Model, timeUtil } from "@btang/ts-lib";
import cmdUtil from "./cmdUtil";
import confParser from "./confParser";
import out from "./out";

export default class CmdRunner extends Model {
    private _data: CmdData;

    constructor(data: any) {
        super();
        this._data = data?.$CLASS$ === "CmdData" ? data : new CmdData(data);
    }

    public trace(): void {
        console.debug(this._data);
    }

    public run(options?: any): Promise<number> {
        options = options || {};
        options.fake = true;
        return this._data?.run(options) || Promise.reject("No commands to run");
    }
}

class CmdData {
    public title: string = "";
    public cwd: string = "";
    public cmdSetList: CmdSet[] = [];
    public displayTotalTime: boolean = false;

    public get $CLASS$(): string {
        return "CmdData";
    }

    constructor(data: any) {
        this.title = confParser.assemble(data?.title || "");
        this.cwd = confParser.assemble(data?.cwd || "");
        this.cmdSetList = (data?.cmdSetList || []).map((s: any) => new CmdSet(s, this.cwd));
        this.displayTotalTime = !!data?.displayTotalTime;
    }

    public run(options?: any): Promise<number> {
        const startTime = new Date().getTime();

        if (this.title) {
            out.header(
                this.title
                    .split("\n")
                    .map((l) => l.trim())
                    .filter((l) => l.length > 0)
            );
        }

        return this._runAllCmdSets(options).then((code: number) => {
            if (this.displayTotalTime) {
                const dur = timeUtil.formatDuring(new Date().getTime() - startTime);
                out.line(`Completed in [green]${dur}[/green]`, false, true);
            }
            return code;
        });
    }

    private _runAllCmdSets(options?: any): Promise<number> {
        let result: Promise<number> = Promise.resolve(0);
        this.cmdSetList.forEach((cmdSet: CmdSet) => {
            result = result.then(() => cmdSet.run(options));
        });
        return result;
    }
}

class CmdSet {
    public cmdList: string[] = [];
    public cwd: string = "";
    public title: string = "";

    constructor(data: any, cmdCwd?: string) {
        this.cwd = confParser.assemble(data?.cwd) || cmdCwd || "";
        this.title = confParser.assemble(data?.title || "");

        const cmd = data?.cmd;
        if (cmd instanceof Array) this.cmdList = cmd;
        else if (typeof data?.cmd === "string") this.cmdList = [cmd];
        else this.cmdList = [];

        this.cmdList = this.cmdList.map((c) => confParser.assemble(c));
    }

    public run(options?: any): Promise<number> {
        const startTime: number = new Date().getTime();

        if (this.title) {
            out.line("   " + this.title, true, false);
            if (!options?.verbal) out.startSpinner(true);
        }

        if (options?.verbal) {
            out.line("[yellow][SPAWN]:[/yellow] " + this.cmdList.join("; "));
        }

        return cmdUtil.runCmdList(this.cmdList, this.cwd, options).then((code: number) => {
            if (code === 0) {
                // end without error.
                if (!options.verbal) {
                    const endTime = new Date().getTime(),
                        durStr = timeUtil.formatDuring(endTime - startTime),
                        duration = `[${durStr}]`;
                    out.stopSpinner();
                    out.prefix(out.successMark);
                    out.append(duration, true);
                }
            } else {
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
