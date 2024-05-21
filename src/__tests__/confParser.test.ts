import confParser from "../cmd/confParser";

describe("ConfParser", () => {
    beforeEach(() => {
        confParser.updateConf("a", "path/to/a");
        confParser.updateConf("x", "x/y/z");
    });

    test("Update regular path", () => {
        expect(confParser.get("a")).toBe("path/to/a");
        expect(confParser.get("x")).toBe("x/y/z");
    });

    test("Password with dash", () => {
        confParser.updateConf("passwd", "abc-def");
        expect(confParser.get("passwd")).toBe("abc-def");
    });

    test("Password with blank", () => {
        confParser.updateConf("passwd", "abc def");
        expect(confParser.get("passwd")).toBe("abc def");
    });

    test("Combined path with another attribute", () => {
        confParser.updateConf("a2", "/tmp/${a}");
        expect(confParser.get("a2")).toBe("/tmp/path/to/a");
    });

    test("Combined path with self", () => {
        confParser.updateConf("a", "/tmp/${}");
        expect(confParser.get("a")).toBe("/tmp/path/to/a");
    });
});
