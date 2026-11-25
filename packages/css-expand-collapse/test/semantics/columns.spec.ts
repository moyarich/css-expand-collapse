import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for columns", () => {
  expectRoundTrip(`.target { columns: 80px 3; }`);
});
