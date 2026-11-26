import { expect, it } from "vitest";
import { collapseToShorthand, type TransformDiagnostic } from "../../src/index.js";

it("distinguishes unresolved variables in map collapse from incompatible values", () => {
  const diagnostics: TransformDiagnostic[] = [];
  expect(collapseToShorthand("margin", { "margin-top": "var(--unknown)" }, {
    onDiagnostic: (item) => diagnostics.push(item),
  })).toBeNull();
  expect(diagnostics).toMatchObject([{ code: "unresolved-value", property: "margin-top" }]);
});
