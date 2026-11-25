import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for overflow", () => {
  expectRoundTrip(`.target { overflow: hidden auto; }`);
});
