import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for border radius", () => {
  expectRoundTrip(`.target { border-radius: 12px 20px / 5px 10px; width: 100px; height: 60px; }`);
});
