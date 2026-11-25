import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for font", () => {
  expectRoundTrip(`.target { font: italic 700 16px/1.5 Arial, sans-serif; }`);
});
