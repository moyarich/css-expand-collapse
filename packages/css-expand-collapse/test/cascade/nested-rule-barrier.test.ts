import { expect, it } from "vitest";
import { collapseDeclarations } from "../../src/index.js";

it.fails("nested rule barrier", () => {
  const result = collapseDeclarations("margin-top:1px;&:hover{margin:0}margin-right:2px;margin-bottom:3px;margin-left:4px");
  expect(result).toContain("margin-top:1px");
  expect(result).toContain("&:hover{margin:0}");
});
