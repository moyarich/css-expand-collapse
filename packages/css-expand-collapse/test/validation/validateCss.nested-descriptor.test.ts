import { expect, it } from "vitest";
import { validateCss } from "../../src/index.js";

it("does not validate descriptors as ordinary properties inside a nested at-rule", () => {
  const result = validateCss(".card { @font-face { src: url(font.woff2); } }");
  expect(result.valid).toBeNull();
  expect(result.diagnostics).toMatchObject([{ code: "unsupported-context", property: "src" }]);
});
