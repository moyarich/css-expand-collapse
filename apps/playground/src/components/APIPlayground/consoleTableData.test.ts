import { describe, expect, it } from "vitest";
import { normalizeConsoleTableData } from "./consoleTableData";

describe("normalizeConsoleTableData", () => {
  it("adds a Value column for primitive arrays", () => {
    expect(normalizeConsoleTableData([3, 23, 34, 21])).toEqual([
      { Value: 3 },
      { Value: 23 },
      { Value: 34 },
      { Value: 21 },
    ]);
  });

  it("preserves arrays of object rows", () => {
    const rows = [
      { name: "margin", value: "10px" },
      { name: "padding", value: "8px" },
    ];

    expect(normalizeConsoleTableData(rows)).toEqual(rows);
  });

  it("preserves keyed object rows when every value is an object", () => {
    const rows = {
      first: { name: "margin", value: "10px" },
      second: { name: "padding", value: "8px" },
    };

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

  it("uses one Value column for mixed array rows", () => {
    expect(
      normalizeConsoleTableData([3, { value: 4 }]),
    ).toEqual([
      { Value: 3 },
      { Value: { value: 4 } },
    ]);
  });

  it("uses one Value column for mixed result objects", () => {
    const declarations = {
      "text-decoration-line": "underline",
      "text-decoration-style": "wavy",
      "text-decoration-color": "purple",
      "text-decoration-thickness": "auto",
    };

    expect(
      normalizeConsoleTableData({
        property: "text-decoration",
        value: "underline wavy purple",
        declarations,
      }),
    ).toEqual({
      property: { Value: "text-decoration" },
      value: { Value: "underline wavy purple" },
      declarations: { Value: declarations },
    });
  });
});
