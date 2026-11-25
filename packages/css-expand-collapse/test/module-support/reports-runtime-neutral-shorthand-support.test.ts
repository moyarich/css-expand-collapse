import { expect, it } from "vitest";
import { supportsTransform } from "../../src/index.js";

it("reports runtime-neutral shorthand support", () => {
  expect(supportsTransform("flex")).toBe(true);
  expect(supportsTransform("background")).toBe(true);
});
