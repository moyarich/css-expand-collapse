import { expect, it } from "vitest";
import { splitTopLevelWhitespace } from "../../src/registry/context.js";

it("uses CSS whitespace and preserves nested functions and strings", () => {
  expect(
    splitTopLevelWhitespace('calc(100% - 1rem)\t"Open Sans"\nsolid'),
  ).toEqual(["calc(100% - 1rem)", '"Open Sans"', "solid"]);
});
