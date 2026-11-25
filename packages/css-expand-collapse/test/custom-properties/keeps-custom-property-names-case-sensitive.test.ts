import { expect, it } from "vitest";
import { resolveCustomProperties } from "../../src/index.js";

it("keeps custom property names case-sensitive", () => {
  expect(
    resolveCustomProperties("var(--Color)", {
      "--Color": "red",
      "--color": "blue",
    }),
  ).toBe("red");

  expect(
    resolveCustomProperties(
      "var(--COLOR)",
      {
        "--Color": "red",
      },
      {
        allowFallbackForMissing: false,
      },
    ),
  ).toBeNull();
});
