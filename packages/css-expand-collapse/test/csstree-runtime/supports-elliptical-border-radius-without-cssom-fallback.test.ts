import { expect, it } from "vitest";
import {
  collapseToShorthand,
  expandShorthand,
  supportsTransform,
} from "../../src/index.js";

it("supports elliptical border-radius without CSSOM fallback", () => {
  expect(
    expandShorthand("border-radius", "10px 20px / 30px 40px")?.declarations,
  ).toEqual({
    "border-top-left-radius": "10px 30px",
    "border-top-right-radius": "20px 40px",
    "border-bottom-right-radius": "10px 30px",
    "border-bottom-left-radius": "20px 40px",
  });
});
