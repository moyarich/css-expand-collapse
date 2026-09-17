import { describe, expect, it } from "vitest";
import {
  splitTopLevelComma,
  splitTopLevelSlash,
  splitTopLevelWhitespace,
} from "../src/registry/context.js";

describe("top-level CSS value splitting", () => {
  it("uses CSS whitespace and preserves nested functions and strings", () => {
    expect(splitTopLevelWhitespace('calc(100% - 1rem)\t"Open Sans"\nsolid')).toEqual([
      "calc(100% - 1rem)",
      '"Open Sans"',
      "solid",
    ]);
  });

  it("splits slash and comma only at the top level", () => {
    expect(splitTopLevelSlash("calc(100% / 2) / span 3")).toEqual([
      "calc(100% / 2)",
      "span 3",
    ]);
    expect(splitTopLevelComma('url("a,b.png"), linear-gradient(red, blue)')).toEqual([
      'url("a,b.png")',
      "linear-gradient(red, blue)",
    ]);
  });
});
