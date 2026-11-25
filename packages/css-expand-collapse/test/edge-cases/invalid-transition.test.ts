import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("invalid transition", () => {
  expect(expandShorthand("transition", "opacity 1s 2s 3s")).toBeNull();
});
