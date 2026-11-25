import { expect, it } from "vitest";
import { validateProperty } from "../../src/index.js";

it("validates shorthand and longhand values", () => {
  expect(validateProperty("margin", "10px 20px")).toEqual({
    valid: true,
    diagnostics: [],
  });
  expect(validateProperty("display", "grid").valid).toBe(true);
});
