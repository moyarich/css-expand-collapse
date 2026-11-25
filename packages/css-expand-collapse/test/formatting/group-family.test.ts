import { expect, it } from "vitest";
import { formatDeclarations } from "../../src/index.js";

it("separates adjacent families without moving duplicate properties", () => {
  expect(formatDeclarations("margin:0;padding:1px;margin-top:2px;margin:3px!important", {
    groupBy: "family",
  })).toBe("margin: 0;\n\npadding: 1px;\n\nmargin-top: 2px;\nmargin: 3px!important;");
});
