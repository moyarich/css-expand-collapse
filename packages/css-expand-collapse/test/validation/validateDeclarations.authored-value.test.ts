import { expect, it } from "vitest";
import { validateDeclarations } from "../../src/index.js";

it("preserves the authored invalid value and its original source range", () => {
  const source = "padding: red /* authored */ blue;";
  const result = validateDeclarations(source);
  expect(result.valid).toBe(false);
  const diagnostic = result.diagnostics.find((item) => item.code === "invalid-property-value");
  expect(diagnostic?.value).toBe("red /* authored */ blue");
  expect(diagnostic?.location).toBeDefined();
  const location = diagnostic!.location!;
  expect(source.slice(location.start.offset, location.end.offset)).toBe(diagnostic?.value);
});
