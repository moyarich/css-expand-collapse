import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for custom property", () => {
  expectRoundTrip(`.target { --space: 8px; margin: var(--space); }`);
});
