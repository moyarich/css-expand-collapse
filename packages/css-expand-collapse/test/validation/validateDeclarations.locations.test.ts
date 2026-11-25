import { expect, it } from "vitest";
import { validateDeclarations } from "../../src/index.js";

it("retains source locations and reports repeated invalid declarations", () => {
  const result = validateDeclarations("margin: 0;\npadding: red;\npadding: red;");
  expect(result.valid).toBe(false);
  expect(result.diagnostics.map((item) => item.location?.start.line)).toEqual([
    2, 3,
  ]);
});
