import readline from "readline";
/**
 * Node.js only.
 */
class Out {
    _spinnerTimer;
    _colors = ["gray", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];
    _createReadline() {
        return readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }
    _hideCursor() {
        const rl = this._createReadline();
        rl.write("\u001B[?25l"); // hides cursor
        rl.close();
    }
    _showCursor() {
        const rl = this._createReadline();
        rl.write("\u001B[?25h"); // show cursor
        rl.close();
    }
    successMark = "[green] ✓ [/green]";
    failedMark = "[red] ✗ [/red]";
    get w() {
        return process.stdout.columns;
    }
    ruler(char = "=", color = "blue") {
        if (!char)
            char = "=";
        else if (char.length > 1)
            char = char[0];
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(this._wrapColor(char.repeat(this.w), color));
        process.stdout.write("\n");
    }
    empty(lines = 1) {
        if (!lines || lines < 1)
            lines = 1;
        process.stdout.write("\n".repeat(lines));
    }
    line(str, fill = false, newline = true) {
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
    success(str) {
        this.line(this.successMark + str);
    }
    failed(str) {
        this.line(this.failedMark + str);
    }
    warning(str) {
        this.line(this._wrapColor(str, "yellow"));
    }
    error(str) {
        this.line("[red]ERROR:[/red] " + str);
    }
    title(str, color = "blue") {
        const titleLen = this._purgeText(str).length, sideLen = Math.floor((this.w - (titleLen + 6)) / 2), side = "=".repeat(sideLen), titleLine = this._wrapColor(`${side} < ${str} > ${side}`, color);
        this.line(titleLine);
    }
    header(strList) {
        this.empty();
        this.title(String(strList.shift()));
        strList.forEach((str) => this.line("[noColor] > " + str));
        this.ruler("-");
    }
    append(str, newline) {
        const textLength = this._purgeText(str).length;
        process.stdout.cursorTo(this.w - textLength);
        process.stdout.write(this._parseColor(str));
        if (newline)
            process.stdout.write("\n");
    }
    prefix(str, newline) {
        process.stdout.cursorTo(0);
        process.stdout.write(this._parseColor(str));
        if (newline) {
            process.stdout.cursorTo(this.w);
            process.stdout.write("\n");
        }
    }
    startSpinner(prefix) {
        this._updateSpinner(0, prefix);
        this._hideCursor();
    }
    stopSpinner() {
        this._showCursor();
        clearTimeout(this._spinnerTimer);
        this.append(" ");
    }
    newline() {
        process.stdout.cursorTo(this.w);
        process.stdout.write("\n");
    }
    _chars1 = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];
    _chars2 = ["◐", "◓", "◑", "◒"];
    _chars = ["|", "/", "-", "\\"];
    _updateSpinner(count, prefix) {
        const char = this._chars[count % this._chars.length];
        if (prefix)
            this.prefix(" " + char);
        else
            this.append(char);
        if (this._spinnerTimer)
            clearTimeout(this._spinnerTimer);
        this._spinnerTimer = setTimeout(() => this._updateSpinner(count + 1, prefix), 100);
    }
    _parseColor(str) {
        if (typeof str !== "string")
            return str;
        this._colors.forEach((color, index) => {
            str = str.replace(new RegExp(`\\[${color}\\]`, "gi"), `\x1b[1;${30 + index}m`);
            str = str.replace(new RegExp(`\\[/${color}\\]`, "gi"), `\x1b[0m`).replace(/\[noColor\]/gi, `\x1b[0m`);
        });
        return str;
    }
    _wrapColor(str, color) {
        const colorNum = this._colors.indexOf(color) + 30;
        if (!isNaN(colorNum)) {
            return `\x1b[1;${colorNum}m` + str + `\x1b[0m`;
        }
        else
            return str;
    }
    _purgeText(str) {
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
