import { expect, it } from "vitest";
import { expandDeclarations } from "../../src/index.js";

it.fails("border image reset", () => {
  const result = expandDeclarations("border-image-source:url(a.png);border:1px solid red");
  expect(result).toContain("border-image-source:none");
});
