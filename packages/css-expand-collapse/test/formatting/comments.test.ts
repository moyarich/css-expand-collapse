import { expect, it } from "vitest";
import { formatDeclarations } from "../../src/index.js";

it("preserves inter-declaration comments", () => {
  const css = "margin:0;/* fallback */margin:1px;";
  expect(formatDeclarations(css)).toBe(css);
});
