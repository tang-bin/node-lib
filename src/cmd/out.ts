import readline, { Interface } from "readline";

/**
 * Node.js only.
 */
class Out {
    private _spinnerTimer: NodeJS.Timeout | undefined;
    private _colors: string[] = ["gray", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];

    private _createReadline(): Interface {
        return readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    private _hideCursor(): void {
        const rl = this._createReadline();
        rl.write("\u001B[?25l"); // hides cursor
        rl.close();
    }

    private _showCursor(): void {
        const rl = this._createReadline();
        rl.write("\u001B[?25h"); // show cursor
        rl.close();
    }

    public successMark: string = "[green] ✓ [/green]";
    public failedMark: string = "[red] ✗ [/red]";

    public get w(): number {
        return process.stdout.columns;
    }

    public ruler(char: string = "=", color: string = "blue"): void {
        if (!char) char = "=";
        else if (char.length > 1) char = char[0];

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(this._wrapColor(char.repeat(this.w), color));
        process.stdout.write("\n");
    }

    public empty(lines: number = 1): void {
        if (!lines || lines < 1) lines = 1;
        process.stdout.write("\n".repeat(lines));
    }

    public line(str: string, fill: boolean = false, newline: boolean = true): void {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(this._parseColor(str));

        if (fill) {
            const gap = this.w - (this._purgeText(str).length % this.w);
            process.stdout.write(".".repeat(gap));
        }

        if (newline) {
            process.stdout.write("\n");
        }
    }

    public success(str: string): void {
        this.line(this.successMark + str);
    }

    public failed(str: string): void {
        this.line(this.failedMark + str);
    }

    public warning(str: string): void {
        this.line(this._wrapColor(str, "yellow"));
    }

    public error(str: string): void {
        this.line("[red]ERROR:[/red] " + str);
    }

    public title(str: string, color: string = "blue"): void {
        const titleLen = this._purgeText(str).length,
            sideLen = Math.floor((this.w - (titleLen + 6)) / 2),
            side = "=".repeat(sideLen),
            titleLine = this._wrapColor(`${side} < ${str} > ${side}`, color);
        this.line(titleLine);
    }

    public header(strList: string[]): void {
        this.empty();
        this.title(String(strList.shift()));
        strList.forEach((str) => this.line("[noColor] > " + str));
        this.ruler("-");
    }

    public append(str: string, newline?: boolean): void {
        const textLength = this._purgeText(str).length;
        process.stdout.cursorTo(this.w - textLength);
        process.stdout.write(this._parseColor(str));
        if (newline) process.stdout.write("\n");
    }

    public prefix(str: string, newline?: boolean): void {
        process.stdout.cursorTo(0);
        process.stdout.write(this._parseColor(str));
        if (newline) {
            process.stdout.cursorTo(this.w);
            process.stdout.write("\n");
        }
    }

    public startSpinner(prefix?: boolean): void {
        this._updateSpinner(0, prefix);
        this._hideCursor();
    }

    public stopSpinner(): void {
        this._showCursor();
        clearTimeout(this._spinnerTimer);
        this.append(" ");
    }

    public newline(): void {
        process.stdout.cursorTo(this.w);
        process.stdout.write("\n");
    }

    private _chars1 = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];
    private _chars2 = ["◐", "◓", "◑", "◒"];
    private _chars = ["|", "/", "-", "\\"];

    private _updateSpinner(count: number, prefix?: boolean): void {
        const char = this._chars[count % this._chars.length];
        if (prefix) this.prefix(" " + char);
        else this.append(char);

        if (this._spinnerTimer) clearTimeout(this._spinnerTimer);
        this._spinnerTimer = setTimeout(() => this._updateSpinner(count + 1, prefix), 100);
    }

    private _parseColor(str: string): string {
        if (typeof str !== "string") return str;

        this._colors.forEach((color, index) => {
            str = str.replace(new RegExp(`\\[${color}\\]`, "gi"), `\x1b[1;${30 + index}m`);
            str = str.replace(new RegExp(`\\[/${color}\\]`, "gi"), `\x1b[0m`).replace(/\[noColor\]/gi, `\x1b[0m`);
        });

        return str;
    }

    private _wrapColor(str: string, color: string): string {
        const colorNum = this._colors.indexOf(color) + 30;
        if (!isNaN(colorNum)) {
            return `\x1b[1;${colorNum}m` + str + `\x1b[0m`;
        } else return str;
    }

    private _purgeText(str: string): string {
        this._colors.forEach((color) => {
            str = str
                .replace(new RegExp(`\\[${color}\\]`, "gi"), "")
                .replace(new RegExp(`\\[/${color}\\]`, "gi"), "")
                .replace(/\[noColor\]/gi, "");
        });
        return str;
    }
}

const out = new Out();
export default out;
