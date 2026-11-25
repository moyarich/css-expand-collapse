import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for nested functions", () => {
  expectRoundTrip(`.target { margin: calc(2px + 3px) max(1px, 4px); }`);
});
