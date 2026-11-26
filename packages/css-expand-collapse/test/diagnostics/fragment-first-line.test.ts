import { expect, it } from "vitest";
import { expandDeclarations, type TransformDiagnostic } from "../../src/index.js";

it("reports fragment diagnostics without synthetic selector offsets", () => {
  const source = "color:red; margin: potato";
  const diagnostics: TransformDiagnostic[] = [];
  expandDeclarations(source, { onDiagnostic: (item) => diagnostics.push(item) });
  const location = diagnostics.find((item) => item.property === "margin")?.location;
  expect(location?.start.offset).toBe(source.indexOf("margin"));
  expect(location?.start.column).toBe(source.indexOf("margin") + 1);
  expect(location?.end.offset).toBe(source.length);
});
