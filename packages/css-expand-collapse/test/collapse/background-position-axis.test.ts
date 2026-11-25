import { expect, it } from "vitest";
import { collapseToShorthand } from "../../src/index.js";

it("collapses equal-length physical axis lists", () => {
  expect(collapseToShorthand("background-position", {
    "background-position-x": "20px, 50%",
    "background-position-y": "50%, 100%",
  })?.value).toBe("20px 50%, 50% 100%");
});
