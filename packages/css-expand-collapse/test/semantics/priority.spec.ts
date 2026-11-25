import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for priority", () => {
  expectRoundTrip(`.target { margin: 10px !important; margin-left: 20px; padding: 1px; padding-top: 5px !important; }`);
});
