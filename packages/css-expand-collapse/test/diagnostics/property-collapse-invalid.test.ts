import { expect, it } from "vitest";
import { collapseToShorthand, type TransformDiagnostic } from "../../src/index.js";

it("identifies an invalid authored longhand when collapsing a declaration map", () => {
  const diagnostics: TransformDiagnostic[] = [];
  expect(collapseToShorthand("margin", { "margin-top": "potato" }, {
    onDiagnostic: (item) => diagnostics.push(item),
  })).toBeNull();
  expect(diagnostics).toMatchObject([{ code: "invalid-property-value", property: "margin-top", value: "potato" }]);
});
