import { expect, it } from "vitest";
import { listShorthands } from "../../src/index.js";

it("includes recognized non-transformable properties", () => {
  expect(listShorthands({ transformable: false })).toEqual(
    expect.arrayContaining([expect.objectContaining({ property: "all" })]),
  );
});
