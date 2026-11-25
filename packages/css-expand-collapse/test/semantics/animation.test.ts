import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for animation", () => {
  expectRoundTrip(`.target { animation: example 2s ease 1s 3 alternate both paused; }`);
});
