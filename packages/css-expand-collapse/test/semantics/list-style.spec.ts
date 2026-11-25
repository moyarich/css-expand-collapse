import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for list style", () => {
  expectRoundTrip(`.target { display:list-item; list-style: square inside; }`);
});
