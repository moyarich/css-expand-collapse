import { expect, it } from "vitest";
import { collapseLonghands } from "../../src/index.js";

const margin = {
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
};

it("collapses a declaration object", () => {
  expect(collapseLonghands({ ...margin, color: "red" })).toEqual({
    color: "red",
    margin: "10px 20px",
  });
});
