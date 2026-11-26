import { expect, it } from "vitest";
import { collapseCss, type TransformDiagnostic } from "../../src/index.js";

it("reports incompatible-values when considering collapse without changing output", () => {
  const source = ".card{margin-top:initial;margin-right:2px;margin-bottom:1px;margin-left:2px}";
  const diagnostics: TransformDiagnostic[] = [];
  expect(collapseCss(source, { onDiagnostic: (item) => diagnostics.push(item) })).toBe(collapseCss(source));
  expect(diagnostics).toEqual(expect.arrayContaining([expect.objectContaining({
    code: "collapse-not-safe", property: "margin", reason: "incompatible-values",
  })]));
});
