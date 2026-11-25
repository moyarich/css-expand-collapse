import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for unknown variable", () => {
  expectRoundTrip(`.target { margin: var(--external, 4px 8px); }`);
});
