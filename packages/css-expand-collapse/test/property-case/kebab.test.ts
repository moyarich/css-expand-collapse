import { expect, it } from "vitest";
import { toKebabCaseDeclarations } from "../../src/index.js";

it("converts CSSOM names to CSS without altering values", () => {
  expect(toKebabCaseDeclarations({
    backgroundColor: "red",
    WebkitTextStroke: "1px red",
    msGridRow: "2",
    cssFloat: "left",
    "--Space": "8px",
  })).toEqual({
    "background-color": "red",
    "-webkit-text-stroke": "1px red",
    "-ms-grid-row": "2",
    float: "left",
    "--Space": "8px",
  });
});
