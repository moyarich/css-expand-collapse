import { expect, it } from "vitest";
import { collapseToShorthand } from "../../src/index.js";

it("fills omitted object longhands with module-owned initial values by default", () => {
  expect(
    collapseToShorthand("inset", {
      top: "0",
      right: "0",
      bottom: "0",
    }),
  ).toEqual({
    property: "inset",
    value: "0 0 0 auto",
    declarations: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "auto",
    },
    consumed: ["top", "right", "bottom"],
  });
});
