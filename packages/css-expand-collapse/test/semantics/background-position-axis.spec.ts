import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("preserves physical background positions through round trips", () => {
  const value = "right 10px bottom 20px, 25% 75%";
  expect(expandShorthand("background-position", value)).not.toBeNull();
  expectRoundTrip(`.target { background-image: linear-gradient(red, blue), linear-gradient(white, black); background-position: ${value}; }`);
});
