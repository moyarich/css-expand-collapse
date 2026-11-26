import { expect, it } from "vitest";
import { expandCss, type TransformDiagnostic } from "../../src/index.js";

it("includes a source position for recovered stylesheet syntax errors", () => {
  const diagnostics: TransformDiagnostic[] = [];
  expandCss(".card { margin 1px; color:red; }", {
    onDiagnostic: (item) => diagnostics.push(item),
  });
  const diagnostic = diagnostics.find((item) => item.code === "invalid-syntax");
  expect(diagnostic?.location?.start.offset).toBeGreaterThan(0);
  expect(diagnostic?.location?.start.line).toBe(1);
});
