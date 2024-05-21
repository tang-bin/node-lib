import { Model } from "@btang/ts-lib";
export default class CmdRunner extends Model {
    private _data;
    constructor(data: any);
    trace(): void;
    run(options?: any): Promise<number>;
}
