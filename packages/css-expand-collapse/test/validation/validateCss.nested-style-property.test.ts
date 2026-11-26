import { expect, it } from "vitest";
import { validateCss } from "../../src/index.js";

it("continues to check ordinary style declarations inside conditional rules", () => {
  const result = validateCss("@media (min-width: 1px) { .card { padding: potato; } }");
  expect(result.valid).toBe(false);
  expect(result.diagnostics).toMatchObject([{ code: "invalid-property-value", property: "padding" }]);
});
