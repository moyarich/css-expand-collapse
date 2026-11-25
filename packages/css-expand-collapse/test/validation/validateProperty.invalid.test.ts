import { expect, it } from "vitest";
import { validateProperty } from "../../src/index.js";

it("reports a known property with an invalid value", () => {
  expect(validateProperty("padding", "red")).toMatchObject({
    valid: false,
    diagnostics: [{ code: "invalid-property-value", property: "padding" }],
  });
});
