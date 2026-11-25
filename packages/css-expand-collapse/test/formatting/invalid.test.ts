import { expect, it } from "vitest";
import { formatDeclarations } from "../../src/index.js";

it("preserves malformed declarations", () => {
  expect(formatDeclarations("margin 0;")).toBe("margin 0;");
});
