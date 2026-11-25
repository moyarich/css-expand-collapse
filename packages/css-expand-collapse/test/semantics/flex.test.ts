import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for flex", () => {
  expectRoundTrip(`.target { display:flex; flex-flow: column wrap; flex: 2 0 10px; gap: 3px 7px; }`);
});
