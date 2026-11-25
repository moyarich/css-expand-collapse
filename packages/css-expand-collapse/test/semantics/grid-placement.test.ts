import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for grid placement", () => {
  expectRoundTrip(`.target { grid-area: 2 / 3 / span 2 / span 3; }`);
});
