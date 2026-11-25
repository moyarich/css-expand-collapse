import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for background layers", () => {
  expectRoundTrip(`.target { background: linear-gradient(red, blue) center / cover no-repeat, white; }`);
});
