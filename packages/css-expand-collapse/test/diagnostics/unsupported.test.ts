import { expect, it } from "vitest";
import { expandCss, type TransformDiagnostic } from "../../src/index.js";

it("reports unsupported shorthand without removing it", () => {
  const diagnostics: TransformDiagnostic[] = [];
  const css = expandCss(".card { all: initial; }", {
    onDiagnostic: (item) => diagnostics.push(item),
  });
  expect(css).toContain("all:initial");
  expect(diagnostics).toMatchObject([{ code: "unsupported-transform", property: "all" }]);
});
