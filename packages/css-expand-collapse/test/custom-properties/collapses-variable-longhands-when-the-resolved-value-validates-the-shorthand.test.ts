import { expect, it } from "vitest";
import { collapseToShorthand } from "../../src/index.js";

it("collapses variable longhands when the resolved value validates the shorthand", () => {
  expect(
    collapseToShorthand(
      "border-color",
      {
        "border-top-color": "var(--color)",
        "border-right-color": "var(--color)",
        "border-bottom-color": "var(--color)",
        "border-left-color": "var(--color)",
      },
      {
        fillMissingLonghands: false,
        customProperties: { "--color": "red" },
      },
    )?.value,
  ).toBe("var(--color)");
});
