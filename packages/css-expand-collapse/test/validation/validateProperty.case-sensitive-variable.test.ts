import { expect, it } from "vitest";
import { validateProperty } from "../../src/index.js";

it("keeps custom-property resolution case-sensitive during validation", () => {
  expect(validateProperty("margin", "var(--Space)", {
    customProperties: { "--space": "1px" },
  })).toMatchObject({
    valid: null,
    diagnostics: [{ code: "unresolved-value" }],
  });
});
