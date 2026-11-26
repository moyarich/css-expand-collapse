import { expect, it } from "vitest";
import { expandDeclarations, type TransformDiagnostic } from "../../src/index.js";

it("preserves later line columns in declaration fragment diagnostics", () => {
  const source = "color:red;\n  margin: potato";
  const diagnostics: TransformDiagnostic[] = [];
  expandDeclarations(source, { onDiagnostic: (item) => diagnostics.push(item) });
  expect(diagnostics.find((item) => item.property === "margin")?.location?.start).toMatchObject({
    offset: source.indexOf("margin"), line: 2, column: 3,
  });
});
