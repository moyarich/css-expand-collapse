import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for outline", () => {
  expectRoundTrip(`.target { outline: 2px dashed blue; }`);
});
