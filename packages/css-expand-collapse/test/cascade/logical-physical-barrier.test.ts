import { expect, it } from "vitest";
import { collapseDeclarations } from "../../src/index.js";

it.fails("logical physical barrier", () => {
  const result = collapseDeclarations("margin-left:1px;margin-inline-start:2px;margin-top:3px;margin-right:4px;margin-bottom:5px");
  expect(result).toContain("margin-left:1px;margin-inline-start:2px");
  expect(result).not.toContain("margin:");
});
