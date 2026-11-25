import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for css wide keywords", () => {
  expectRoundTrip(`.target { margin: inherit; padding: initial; border-radius: unset; }`);
});
