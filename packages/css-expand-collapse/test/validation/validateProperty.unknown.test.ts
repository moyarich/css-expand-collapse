import { expect, it } from "vitest";
import { validateProperty } from "../../src/index.js";

it("distinguishes unknown grammar from invalid values", () => {
  expect(validateProperty("future-css-property", "auto")).toMatchObject({
    valid: null,
    diagnostics: [{ code: "unknown-property" }],
  });
});
