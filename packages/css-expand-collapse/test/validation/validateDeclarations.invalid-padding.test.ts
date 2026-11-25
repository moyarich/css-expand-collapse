import { expect, it } from "vitest";
import { validateDeclarations } from "../../src/index.js";

it("rejects the documented invalid padding declaration", () => {
  expect(validateDeclarations("padding: red;")).toMatchObject({
    valid: false,
    diagnostics: [{ code: "invalid-property-value", property: "padding" }],
  });
});
