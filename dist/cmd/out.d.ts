/**
 * Node.js only.
 */
declare class Out {
    private _spinnerTimer;
    private _colors;
    private _createReadline;
    private _hideCursor;
    private _showCursor;
    successMark: string;
    failedMark: string;
    get w(): number;
    ruler(char?: string, color?: string): void;
    empty(lines?: number): void;
    line(str: string, fill?: boolean, newline?: boolean): void;
    success(str: string): void;
    failed(str: string): void;
    warning(str: string): void;
    error(str: string): void;
    title(str: string, color?: string): void;
    header(strList: string[]): void;
    append(str: string, newline?: boolean): void;
    prefix(str: string, newline?: boolean): void;
    startSpinner(prefix?: boolean): void;
    stopSpinner(): void;
    newline(): void;
    private _chars1;
    private _chars2;
    private _chars;
    private _updateSpinner;
    private _parseColor;
    private _wrapColor;
    private _purgeText;
}
declare const out: Out;
export default out;
