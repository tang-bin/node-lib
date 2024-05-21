import argvParser from "../cmd/argvParser";

function addArgv(args: string[]): string[] {
    return ["bin/node", "main.js", ...args];
}

describe("ArgvParser", () => {
    beforeEach(() => {});

    test("Build and patch to one IP", () => {
        argvParser.parse(addArgv(["-bp", "1.1.1.1"]));
        expect(argvParser.has("b")).toBe(true);
        expect(argvParser.has("p")).toBe(true);
    });

    test("Patch to two IPs", () => {
        argvParser.parse(addArgv(["-p", "1.1.1.1", "2.2.2.2"]));
        expect(argvParser.has("p")).toBe(true);
        expect(argvParser.getMultiple("p")).toEqual(["1.1.1.1", "2.2.2.2"]);
    });

    test("Specify password", () => {
        argvParser.parse(addArgv(["--passwd", "abc-123*11"]));
        expect(argvParser.has("passwd")).toBe(true);
        expect(argvParser.get("passwd")).toBe("abc-123*11");
    });
});
