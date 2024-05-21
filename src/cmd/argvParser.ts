import path from "path";

/**
 * Node.js only.
 * All Options:
 */
class ArgvParser {
    public cmd: string = "";

    public outputPath: string = "";
    public curWs: string = "";

    public nodePath: string = "";
    public filePath: string = "";
    public cwd: string = "";
    public appName: string = "";

    private _origArgv: string[] = [];
    private _argvDict: { [name: string]: string[] } = {};

    constructor() {}

    public parse(argv: string[]): void {
        this.reset();

        this._origArgv = argv;
        this._parseArgs();
    }

    public has(name: string): boolean {
        const arg: string[] = this._argvDict[name];
        return !!arg?.length;
    }

    public hasMultiple(name: string): boolean {
        const arg: string[] = this._argvDict[name];
        return arg?.length > 1;
    }

    public get(name: string): string | undefined {
        const argv: string[] = this._argvDict[name];
        return argv?.at(0);
    }

    public getMultiple(name: string): string[] {
        return this._argvDict[name] || [];
    }

    public reset(): void {
        this._origArgv = [];
        this._argvDict = {};

        this.cmd = "";
        this.outputPath = "";
        this.curWs = "";
        this.nodePath = "";
        this.filePath = "";
        this.cwd = "";
        this.appName = "";
    }

    public ls(): void {
        console.log("argv: ", this._argvDict);
    }

    private _parseArgs(): void {
        this.nodePath = this._origArgv[0];
        this.filePath = path.dirname(this._origArgv[1]);
        this.cwd = __dirname;
        this.appName = path.basename(this._origArgv[1]);

        let curArg: string = "";
        this._normalize(this._origArgv.slice(2)).forEach((arg: string, index: number, { length }) => {
            if (/^"(.+)"$/.test(arg)) {
                arg = arg.slice(1, -1);
            }

            if (/^--\w+$/.test(arg)) {
                const newArg = String(arg.slice(2)).trim().toLowerCase();
                if (newArg && newArg !== curArg) {
                    if (curArg && !this._argvDict[curArg].length) {
                        // Current arg has no parameters
                        this._argvDict[curArg] = [""];
                    }
                    if (index === length - 1) {
                        // New arg is the last arg.
                        this._argvDict[newArg] = [""];
                    }
                    if (!this._argvDict[newArg]) this._argvDict[newArg] = [];
                    curArg = newArg;
                }
            } else if (curArg) {
                this._argvDict[curArg].push(arg);
            } else {
                this.cmd = String(arg).trim().toLowerCase();
            }
        });
    }

    private _normalize(args: string[]): string[] {
        const rs: string[] = [];

        (args || []).forEach((arg) => {
            if (/-[a-zA-Z]+/.test(arg) && arg[1] !== "-") {
                for (let i = 1; i < arg.length; i++) {
                    const char = arg.charAt(i);
                    if (char) rs.push("--" + char);
                }
            } else rs.push(arg);
        });
        return rs;
    }
}

const argvParser = new ArgvParser();
export default argvParser;
