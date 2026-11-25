import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands mask position layers", () => {
  const result = expandShorthand("mask", "linear-gradient(black, transparent) left 10px top 20px / cover no-repeat, linear-gradient(white, black) right 15% bottom 5px / contain repeat");
  expect(result?.declarations["mask-position"]).toBe("left 10px top 20px, right 15% bottom 5px");
});
