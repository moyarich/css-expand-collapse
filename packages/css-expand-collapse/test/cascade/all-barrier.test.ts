import { expect, it } from "vitest";
import { collapseDeclarations } from "../../src/index.js";

it.fails("all barrier", () => {
  const result = collapseDeclarations("margin-top:1px;all:initial;margin-right:2px;margin-bottom:3px;margin-left:4px");
  expect(result).toContain("margin-top:1px;all:initial");
  expect(result).not.toContain("margin:");
});
