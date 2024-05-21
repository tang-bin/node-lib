/**
 * Node.js only.
 * All Options:
 */
declare class ArgvParser {
    cmd: string;
    outputPath: string;
    curWs: string;
    nodePath: string;
    filePath: string;
    cwd: string;
    appName: string;
    private _origArgv;
    private _argvDict;
    constructor();
    parse(argv: string[]): void;
    has(name: string): boolean;
    hasMultiple(name: string): boolean;
    get(name: string): string | undefined;
    getMultiple(name: string): string[];
    reset(): void;
    ls(): void;
    private _parseArgs;
    private _normalize;
}
declare const argvParser: ArgvParser;
export default argvParser;
