import { expect, it } from "vitest";
import { expandShorthand, type TransformDiagnostic } from "../../src/index.js";

it("reports unresolved property values without transforming them", () => {
  const diagnostics: TransformDiagnostic[] = [];
  expect(expandShorthand("margin", "var(--missing)", {
    onDiagnostic: (item) => diagnostics.push(item),
  })).toBeNull();
  expect(diagnostics).toMatchObject([{ code: "unresolved-value", property: "margin" }]);
});
