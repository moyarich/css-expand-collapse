import { expect, it } from "vitest";
import { validateDeclarations } from "../../src/index.js";

it("reports malformed declaration syntax", () => {
  expect(validateDeclarations("padding red;")).toMatchObject({
    valid: false,
    diagnostics: [{ code: "invalid-syntax" }],
  });
});
