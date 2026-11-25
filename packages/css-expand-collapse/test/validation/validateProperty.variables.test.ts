import { expect, it } from "vitest";
import { validateProperty } from "../../src/index.js";

it("resolves supplied variables and defers unresolved references", () => {
  expect(
    validateProperty("margin", "var(--Space)", {
      customProperties: { "--Space": "8px 16px" },
    }).valid,
  ).toBe(true);
  expect(validateProperty("margin", "var(--Space, 8px)").valid).toBeNull();
  expect(
    validateProperty("margin", "var(--Space)", {
      customProperties: { "--space": "8px" },
    }).valid,
  ).toBeNull();
});
