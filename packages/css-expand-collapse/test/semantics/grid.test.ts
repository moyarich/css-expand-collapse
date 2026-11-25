import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for grid", () => {
  expectRoundTrip(`.target { display:grid; grid: auto-flow dense 20px / 1fr 2fr; gap: 3px 6px; }`);
});
