import { expect, it } from "vitest";
import { collapseDeclarations } from "../../src/index.js";

it.fails("border collapse no image reset", () => {
  const result = collapseDeclarations("border-top-width:1px;border-top-style:solid;border-top-color:red;border-right-width:1px;border-right-style:solid;border-right-color:red;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:red;border-left-width:1px;border-left-style:solid;border-left-color:red");
  expect(result).not.toContain("border:");
});
