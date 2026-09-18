import { describe, expect, it } from "vitest";
import { runFunctionSource } from "./run";

describe("runFunctionSource console capture", () => {
  it("captures primitive console.log values", () => {
    const output = runFunctionSource(
      `console.log("text", 2, true, null, undefined);`,
    );

    expect(output.error).toBe("");
    expect(output.messages).toEqual([
      {
        method: "log",
        data: ["text", 2, true, null, undefined],
        depth: 0,
      },
    ]);
  });

  it("captures object and array values without stringifying them", () => {
    const output = runFunctionSource(
      `console.log({ margin: "10px" }, [1, 2, 3]);`,
    );

    expect(output.messages[0]).toEqual({
      method: "log",
      data: [{ margin: "10px" }, [1, 2, 3]],
      depth: 0,
    });
  });

  it("maps console.dir depth options to inspector metadata", () => {
    const output = runFunctionSource(
      `console.dir({ nested: { value: 1 } }, { depth: null, showHidden: true });`,
    );

    expect(output.messages[0]).toEqual({
      method: "dir",
      data: [{ nested: { value: 1 } }],
      depth: 0,
      expandLevel: 100,
      showNonenumerable: true,
    });
  });

  it("captures console.table data and optional columns", () => {
    const output = runFunctionSource(
      `console.table([{ name: "margin", value: "10px" }], ["name"]);`,
    );

    expect(output.messages[0]).toEqual({
      method: "table",
      data: [[{ name: "margin", value: "10px" }]],
      depth: 0,
      columns: ["name"],
    });
  });

  it("captures warn, error, and failed assertions", () => {
    const output = runFunctionSource(`
      console.warn("warning");
      console.error("error");
      console.assert(false, "assertion");
      console.assert(true, "hidden");
    `);

    expect(output.messages.map(({ method }) => method)).toEqual([
      "warn",
      "error",
      "assert",
    ]);
  });

  it("tracks group indentation", () => {
    const output = runFunctionSource(`
      console.group("outer");
      console.log("inside");
      console.groupEnd();
      console.log("outside");
    `);

    expect(output.messages.map(({ method, depth }) => ({ method, depth }))).toEqual([
      { method: "group", depth: 0 },
      { method: "log", depth: 1 },
      { method: "log", depth: 0 },
    ]);
  });

  it("clears previously captured output", () => {
    const output = runFunctionSource(`
      console.log("before");
      console.clear();
      console.log("after");
    `);

    expect(output.messages).toEqual([
      {
        method: "log",
        data: ["after"],
        depth: 0,
      },
    ]);
  });

  it("captures counters and timers", () => {
    const output = runFunctionSource(`
      console.count("items");
      console.count("items");
      console.time("work");
      console.timeLog("work", "running");
      console.timeEnd("work");
    `);

    expect(output.messages[0]?.data).toEqual(["items: 1"]);
    expect(output.messages[1]?.data).toEqual(["items: 2"]);
    expect(output.messages[2]?.method).toBe("log");
    expect(String(output.messages[2]?.data[0])).toMatch(/^work: \d+\.\d{2} ms$/);
    expect(output.messages[2]?.data[1]).toBe("running");
    expect(output.messages[3]?.method).toBe("timeEnd");
    expect(String(output.messages[3]?.data[0])).toMatch(/^work: \d+\.\d{2} ms$/);
  });

  it("returns runtime errors separately from console messages", () => {
    const output = runFunctionSource(`
      console.log("before");
      throw new Error("boom");
    `);

    expect(output.messages[0]?.data).toEqual(["before"]);
    expect(output.error).toContain("boom");
  });
});
