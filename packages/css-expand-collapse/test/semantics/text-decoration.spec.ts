import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for text decoration", () => {
  expectRoundTrip(`.target { text-decoration: underline wavy red 2px; }`);
});
