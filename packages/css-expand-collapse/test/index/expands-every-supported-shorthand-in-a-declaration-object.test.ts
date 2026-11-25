import { expect, it } from "vitest";
import { expandShorthands } from "../../src/index.js";

it("expands every supported shorthand in a declaration object", () => {
  expect(
    expandShorthands({
      margin: "10px 20px",
      color: "red",
    }),
  ).toEqual({
    "margin-top": "10px",
    "margin-right": "20px",
    "margin-bottom": "10px",
    "margin-left": "20px",
    color: "red",
  });
});
