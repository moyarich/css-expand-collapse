import { expect, it } from "vitest";
import { collapseToShorthand, type TransformDiagnostic } from "../../src/index.js";

it("reports missing constituents when initial filling is disabled", () => {
  const diagnostics: TransformDiagnostic[] = [];
  expect(collapseToShorthand("margin", { "margin-top": "1px" }, {
    fillMissingLonghands: false, onDiagnostic: (item) => diagnostics.push(item),
  })).toBeNull();
  expect(diagnostics).toMatchObject([{ code: "collapse-not-safe", reason: "missing-longhands", property: "margin" }]);
});
