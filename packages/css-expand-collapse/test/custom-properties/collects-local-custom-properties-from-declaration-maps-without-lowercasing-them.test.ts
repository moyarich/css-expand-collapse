import { expect, it } from "vitest";
import { expandShorthands } from "../../src/index.js";

it("collects local custom properties from declaration maps without lowercasing them", () => {
  expect(
    expandShorthands({
      "--Color": "red",
      "border-color": "var(--Color)",
    }),
  ).toEqual({
    "--Color": "red",
    "border-top-color": "var(--Color)",
    "border-right-color": "var(--Color)",
    "border-bottom-color": "var(--Color)",
    "border-left-color": "var(--Color)",
  });
});
