import { expect, it } from "vitest";
import { collapseToShorthand } from "../../src/index.js";

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
