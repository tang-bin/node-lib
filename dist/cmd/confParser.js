import fs from "fs";
import path from "path";
import pathUtil from "../utils/pathUtil";
import { dataUtil, log } from "@btang/ts-lib";
import argvParser from "./argvParser";
class ConfParser {
    _config = {};
    defaultConfig = {};
    constructor() { }
    get(refPath, guessType = true) {
        let conf = dataUtil.readByPath(this._config, refPath);
        if ((conf === null || conf === undefined) && this.defaultConfig) {
            conf = dataUtil.readByPath(this.defaultConfig, refPath);
        }
        if (guessType)
            return dataUtil.guessType(conf);
        else
            return conf;
    }
    /**
     *
     * @param filePath
     * @param cwd
     * @param override If true, override the all loaded configurations by this process.
     * @returns
     */
    load(filePath, cwd, override) {
        if (typeof filePath === "string")
            filePath = [filePath];
        filePath.forEach((p) => {
            p = pathUtil.regularPath(p);
            if (cwd)
                p = path.join(cwd, p);
            if (fs.existsSync(p)) {
                log.msg("customized config file exists");
                try {
                    const config = JSON.parse(fs.readFileSync(p).toString());
                    if (override)
                        this._config = config;
                    else
                        this._config = dataUtil.combine(this._config, config);
                }
                catch (e) {
                    log.error("customized config file parse failed, ignore.");
                    this._config = {};
                }
            }
        });
        log.msg("Config updated: " + this.toString());
        return this;
    }
    assemble(str) {
        str = String(str || "");
        // find ${n} and replace with the value from vars.
        (str.match(/\$\{(.*?)\}/gi) || []).forEach((m) => {
            const v = this.getVar(m.slice(2, -1));
            if (v)
                str = str.replaceAll(m, v);
        });
        // find @{n} and replace with the value from argv
        (str.match(/\@\{(.*?)\}/gi) || []).forEach((m) => {
            let v = argvParser.get(m.slice(2, -1)); // get value from argv
            if (v === undefined)
                v = this.getVar(m.slice(2, -1)); // use value from config if not found in argv
            if (v)
                str = str.replaceAll(m, v);
        });
        return str;
    }
    getVar(name) {
        const vars = this._config?.var;
        const v = vars && vars[name] !== undefined ? String(vars[name]).trim() : "";
        return this.assemble(v);
    }
    updateConf(name, target) {
        name = String(name).trim();
        if (name) {
            if (typeof target === "function") {
                this._config[name] = target.call(this, this.get(name));
            }
            else if (typeof target === "string") {
                const matches = target.match(/\$\{(.*?)\}/gi) || [];
                matches.forEach((m) => {
                    const refPath = m.slice(2, -1);
                    if (!refPath)
                        target = target.replaceAll(m, this.get(name));
                    else
                        target = target.replaceAll(m, this.get(refPath) || m);
                });
                this._config[name] = target;
            }
            else {
                this._config[name] = target;
            }
        }
        return this;
    }
    toString() {
        return ("{\n" +
            Object.keys(this._config)
                .map((key) => `\t${key}: ${this._config[key]}`)
                .join("\n") +
            "\n}");
    }
}
const confParser = new ConfParser();
export default confParser;
