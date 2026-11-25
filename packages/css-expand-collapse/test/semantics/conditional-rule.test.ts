import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for conditional rule", () => {
  expectRoundTrip(`.target { padding: 3px; @media (min-width: 400px) { padding: 5px 7px; } }`);
});
