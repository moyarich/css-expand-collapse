import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("invalid animation", () => {
  expect(expandShorthand("animation", "1s 2s 3s")).toBeNull();
});
