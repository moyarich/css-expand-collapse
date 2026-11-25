import { expect, it } from "vitest";
import { validateCss } from "../../src/index.js";

it("does not misclassify at-rule descriptors as unknown CSS properties", () => {
  expect(validateCss('@font-face { src: url("font.woff2"); }')).toMatchObject({
    valid: null,
    diagnostics: [{ code: "unsupported-context", property: "src" }],
  });
});
