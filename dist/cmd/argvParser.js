import path from "path";
/**
 * Node.js only.
 * All Options:
 */
class ArgvParser {
    cmd = "";
    outputPath = "";
    curWs = "";
    nodePath = "";
    filePath = "";
    cwd = "";
    appName = "";
    _origArgv = [];
    _argvDict = {};
    constructor() { }
    parse(argv) {
        this.reset();
        this._origArgv = argv;
        this._parseArgs();
    }
    has(name) {
        const arg = this._argvDict[name];
        return !!arg?.length;
    }
    hasMultiple(name) {
        const arg = this._argvDict[name];
        return arg?.length > 1;
    }
    get(name) {
        const argv = this._argvDict[name];
        return argv?.at(0);
    }
    getMultiple(name) {
        return this._argvDict[name] || [];
    }
    reset() {
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
    ls() {
        console.log("argv: ", this._argvDict);
    }
    _parseArgs() {
        this.nodePath = this._origArgv[0];
        this.filePath = path.dirname(this._origArgv[1]);
        this.cwd = __dirname;
        this.appName = path.basename(this._origArgv[1]);
        let curArg = "";
        this._normalize(this._origArgv.slice(2)).forEach((arg, index, { length }) => {
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
                    if (!this._argvDict[newArg])
                        this._argvDict[newArg] = [];
                    curArg = newArg;
                }
            }
            else if (curArg) {
                this._argvDict[curArg].push(arg);
            }
            else {
                this.cmd = String(arg).trim().toLowerCase();
            }
        });
    }
    _normalize(args) {
        const rs = [];
        (args || []).forEach((arg) => {
            if (/-[a-zA-Z]+/.test(arg) && arg[1] !== "-") {
                for (let i = 1; i < arg.length; i++) {
                    const char = arg.charAt(i);
                    if (char)
                        rs.push("--" + char);
                }
            }
            else
                rs.push(arg);
        });
        return rs;
    }
}
const argvParser = new ArgvParser();
export default argvParser;
