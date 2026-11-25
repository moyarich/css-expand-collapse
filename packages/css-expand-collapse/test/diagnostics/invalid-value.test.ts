import { expect, it } from "vitest";
import { expandCss, type TransformDiagnostic } from "../../src/index.js";

it("reports a skipped shorthand with source coordinates", () => {
  const diagnostics: TransformDiagnostic[] = [];
  expandCss(".card {\n padding: red; }", {
    onDiagnostic: (item) => diagnostics.push(item),
  });
  expect(diagnostics).toMatchObject([{ code: "invalid-property-value", location: { start: { line: 2 } } }]);
});
