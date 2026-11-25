import { expect, it } from "vitest";
import { collapseToShorthand } from "../../src/index.js";

it("can require a complete object declaration map", () => {
  expect(
    collapseToShorthand(
      "inset",
      {
        top: "0",
        right: "0",
        bottom: "0",
      },
      {
        fillMissingLonghands: false,
      },
    ),
  ).toBeNull();
});
