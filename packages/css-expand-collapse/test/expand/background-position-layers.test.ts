import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands background position layers", () => {
  const result = expandShorthand("background", "linear-gradient(red, blue) left 10px top 20px / cover no-repeat, linear-gradient(black, white) right 15% bottom 5px / contain repeat");
  expect(result?.declarations["background-position"]).toBe("left 10px top 20px, right 15% bottom 5px");
});
