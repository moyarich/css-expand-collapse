import { expect, it } from "vitest";
import { collapseCss, type TransformDiagnostic } from "../../src/index.js";

it("reports missing-longhands when considering collapse without changing output", () => {
  const source = ".card{margin-top:1px}";
  const diagnostics: TransformDiagnostic[] = [];
  expect(collapseCss(source, { onDiagnostic: (item) => diagnostics.push(item) })).toBe(collapseCss(source));
  expect(diagnostics).toEqual(expect.arrayContaining([expect.objectContaining({
    code: "collapse-not-safe", property: "margin", reason: "missing-longhands",
  })]));
});
