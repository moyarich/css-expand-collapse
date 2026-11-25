import { expect, it } from "vitest";
import { listShorthands } from "../../src/index.js";

it("filters shorthands by category and transformation support", () => {
  const result = listShorthands({ category: "background", transformable: true });
  expect(result.map(({ property }) => property)).toContain("background");
  expect(result.every((item) => item.category === "background" && item.transformable)).toBe(true);
});
