import cmd from "../cmd/cmdUtil";

describe("cmd", () => {
    beforeEach(() => {
        cmd.verbal = true;
    });

    test("run a single cmd", () => {
        cmd.exec("ls");
    });

    test("run a serial of cmds", () => {
        cmd.exec(["ls", "pwd", "echo hello"]);
    });

    test("run a cmd with title", () => {
        cmd.exec("echo with title", process.cwd(), "this is a title");
    });
});
