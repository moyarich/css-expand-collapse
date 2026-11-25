import { expect, it } from "vitest";
import { formatDeclarations } from "../../src/index.js";

it("formats declarations without reordering or losing priority", () => {
  expect(formatDeclarations("margin:0;margin:8px!important;--Space: 1px  2px", {
    indent: "  ",
    trailingSemicolon: false,
  })).toBe("  margin: 0;\n  margin: 8px!important;\n  --Space: 1px  2px");
});
