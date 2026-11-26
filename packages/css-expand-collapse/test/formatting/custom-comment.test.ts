import { expect, it } from "vitest";
import { formatDeclarations } from "../../src/index.js";

it("preserves custom property tokens and whitespace with an authored comment before the colon", () => {
  const source = "--Theme /* authored */ :  red  ; color:red";
  const output = formatDeclarations(source, { groupBy: "family" });
  expect(output).toBe("--Theme /* authored */ :  red  ;\n\ncolor: red;");
});
