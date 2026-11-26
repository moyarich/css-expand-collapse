import { expect, it } from "vitest";
import { collapseToShorthand, type TransformDiagnostic } from "../../src/index.js";

it("reports a collapse candidate with an invalid longhand", () => {
  const diagnostics: TransformDiagnostic[] = [];
  expect(collapseToShorthand("margin", { "margin-top": "red" }, {
    onDiagnostic: (item) => diagnostics.push(item),
  })).toBeNull();
  expect(diagnostics).toMatchObject([{ code: "invalid-property-value", property: "margin-top", value: "red" }]);
});
