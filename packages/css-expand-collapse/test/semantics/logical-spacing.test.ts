import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for logical spacing", () => {
  expectRoundTrip(`.target { direction:rtl; writing-mode:vertical-rl; margin-inline: 3px 9px; padding-block: 2px 6px; }`);
});
