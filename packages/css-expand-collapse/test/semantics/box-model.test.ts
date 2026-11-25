import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for box model", () => {
  expectRoundTrip(`.target { padding: 1px 2px 3px; margin: 4px 5px 6px 7px; width: 100px; }`);
});
