import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("unknown property", () => {
  expect(expandShorthand("not-a-css-property", "anything")).toBeNull();
});
