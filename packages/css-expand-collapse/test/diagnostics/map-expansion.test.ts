import { expect, it } from "vitest";
import { expandShorthands, type TransformDiagnostic } from "../../src/index.js";

it("reports invalid shorthand values but not ordinary longhands", () => {
  const diagnostics: TransformDiagnostic[] = [];
  expect(expandShorthands({ padding: "red", color: "red" }, {
    onDiagnostic: (item) => diagnostics.push(item),
  })).toEqual({ padding: "red", color: "red" });
  expect(diagnostics).toMatchObject([{ code: "invalid-property-value", property: "padding" }]);
});
