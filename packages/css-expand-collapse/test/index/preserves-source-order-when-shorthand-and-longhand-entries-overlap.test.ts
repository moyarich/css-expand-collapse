import { expect, it } from "vitest";
import { expandShorthands } from "../../src/index.js";

it("preserves source order when shorthand and longhand entries overlap", () => {
  expect(
    expandShorthands({
      inset: "auto",
      top: "0",
    }),
  ).toEqual({
    top: "0",
    right: "auto",
    bottom: "auto",
    left: "auto",
  });

  expect(
    expandShorthands({
      top: "0",
      inset: "auto",
    }),
  ).toEqual({
    top: "auto",
    right: "auto",
    bottom: "auto",
    left: "auto",
  });
});
