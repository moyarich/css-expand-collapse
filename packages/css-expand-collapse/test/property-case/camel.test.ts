import { expect, it } from "vitest";
import { toCamelCaseDeclarations } from "../../src/index.js";

it("converts CSS declaration keys to CSSOM spelling", () => {
  expect(toCamelCaseDeclarations({
    "background-color": "red",
    "-webkit-text-stroke": "1px red",
    "-ms-grid-row": "2",
    float: "left",
    "--Space": "8px",
  })).toEqual({
    backgroundColor: "red",
    WebkitTextStroke: "1px red",
    msGridRow: "2",
    cssFloat: "left",
    "--Space": "8px",
  });
});
