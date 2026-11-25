import { expect, it } from "vitest";
import { getShorthandMetadata } from "../../src/index.js";

it("returns undefined for unknown properties", () => {
  expect(getShorthandMetadata("unknown-property")).toBeUndefined();
});
