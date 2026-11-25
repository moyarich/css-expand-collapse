import { expect, it } from "vitest";
import { formatDeclarations } from "../../src/index.js";

it("separates adjacent physical sides while preserving source order", () => {
  expect(formatDeclarations("margin-top:1px;border-top-width:2px;padding-left:3px;top:4px", {
    groupBy: "side",
  })).toBe("margin-top: 1px;\nborder-top-width: 2px;\n\npadding-left: 3px;\n\ntop: 4px;");
});
