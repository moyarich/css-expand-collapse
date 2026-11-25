import { expect, it } from "vitest";
import { collapseCss, type TransformDiagnostic } from "../../src/index.js";

it("reports an incompatible collapse candidate", () => {
  const diagnostics: TransformDiagnostic[] = [];
  collapseCss(".card { margin-top: initial; margin-right: 1px; margin-bottom: 1px; margin-left: 1px; }", {
    onDiagnostic: (item) => diagnostics.push(item),
  });
  expect(diagnostics).toEqual(expect.arrayContaining([expect.objectContaining({ code: "collapse-not-safe", property: "margin" })]));
});
