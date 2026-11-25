import { expect, it } from "vitest";
import { validateProperty } from "../../src/index.js";

it("does not claim validity for runtime environment values", () => {
  expect(validateProperty("padding-top", "env(safe-area-inset-top)")).toMatchObject({
    valid: null,
    diagnostics: [{ code: "unresolved-value" }],
  });
});
