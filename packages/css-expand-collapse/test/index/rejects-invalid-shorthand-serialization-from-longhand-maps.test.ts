import { expect, it } from "vitest";
import { collapseToShorthand } from "../../src/index.js";

const margin = {
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
};

it("rejects invalid shorthand serialization from longhand maps", () => {
  expect(
    collapseToShorthand(
      "margin",
      {
        "margin-top": "garbage",
        "margin-right": "garbage",
        "margin-bottom": "garbage",
        "margin-left": "garbage",
      },
      {
        fillMissingLonghands: false,
      },
    ),
  ).toBeNull();
});
