import path from "path";
import os from "os";

/**
 * Node.js only.
 */
class PathUtil {
    public safePath(p: string): string {
        p = String(p || "").trim();
        if (p === "" || p === "/") return "/tmp/safe-path";
        else return p;
    }

    public regularPath(p: string, cwd: string = ""): string {
        p = String(p || "").trim();
        if (p.startsWith("~")) {
            p = path.join(os.homedir(), p.slice(1));
        } else if (cwd) {
            p = path.join(cwd, p);
        }
        return p;
    }

    public displayPath(p: string): string {
        const home = os.homedir();
        if (p.startsWith(home)) {
            p = p.replace(home, "~");
        }
        return p;
    }
}

const pathUtil = new PathUtil();
export default pathUtil;
