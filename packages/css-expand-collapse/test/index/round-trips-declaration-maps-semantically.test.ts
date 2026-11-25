import { expect, it } from "vitest";
import { collapseLonghands, expandShorthands } from "../../src/index.js";

it("round-trips declaration maps semantically", () => {
  const expanded = expandShorthands({
    margin: "10px 20px",
    color: "red",
  });

  expect(collapseLonghands(expanded)).toEqual({
    color: "red",
    margin: "10px 20px",
  });
});
