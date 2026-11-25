import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for transition", () => {
  expectRoundTrip(`.target { transition: opacity 1s ease 2s, color 3s linear; }`);
});
