declare class ConfParser {
    private _config;
    defaultConfig: {
        [name: string]: any;
    };
    constructor();
    get(refPath: string, guessType?: boolean): any;
    /**
     *
     * @param filePath
     * @param cwd
     * @param override If true, override the all loaded configurations by this process.
     * @returns
     */
    load(filePath: string | string[], cwd?: string, override?: boolean): ConfParser;
    assemble(str: string): string;
    getVar(name: string): string;
    updateConf(name: string, target: Function | any): ConfParser;
    toString(): string;
}
declare const confParser: ConfParser;
export default confParser;
