/**
 * Node.js only.
 */
declare class PathUtil {
    safePath(p: string): string;
    regularPath(p: string, cwd?: string): string;
    displayPath(p: string): string;
}
declare const pathUtil: PathUtil;
export default pathUtil;
