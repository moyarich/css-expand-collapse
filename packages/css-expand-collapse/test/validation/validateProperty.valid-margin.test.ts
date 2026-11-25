import { expect, it } from "vitest";
import { validateProperty } from "../../src/index.js";

it("validates the documented margin example", () => {
  expect(validateProperty("margin", "8px 16px")).toEqual({
    valid: true,
    diagnostics: [],
  });
});
