import { describe, expect, it } from "vitest";
import { normalizeConsoleTableData } from "./consoleTable";

describe("normalizeConsoleTableData", () => {
  it("adds a Value column for primitive arrays", () => {
    expect(normalizeConsoleTableData([3, 23, 34, 21])).toEqual([
      { Value: 3 },
      { Value: 23 },
      { Value: 34 },
      { Value: 21 },
    ]);
  });

  it("preserves object rows", () => {
    const rows = [
      { name: "margin", value: "10px" },
      { name: "padding", value: "8px" },
    ];

    expect(normalizeConsoleTableData(rows)).toEqual(rows);
  });

  it("normalizes primitive values in keyed objects", () => {
    expect(
      normalizeConsoleTableData({
        first: 3,
        second: "hello",
      }),
    ).toEqual({
      first: { Value: 3 },
      second: { Value: "hello" },
    });
  });

  it("supports mixed primitive and object rows", () => {
    expect(
      normalizeConsoleTableData([3, { value: 4 }]),
    ).toEqual([
      { Value: 3 },
      { value: 4 },
    ]);
  });
});
