import { expect, it } from "vitest";
import { formatDeclarations } from "../../src/index.js";

it("keeps directional and logical declarations in authored order", () => {
  expect(formatDeclarations("margin-left:1px;margin-inline-start:2px;margin-left:3px!important", { groupBy: "side" })).toBe(
    "margin-left: 1px;\n\nmargin-inline-start: 2px;\n\nmargin-left: 3px!important;",
  );
});
