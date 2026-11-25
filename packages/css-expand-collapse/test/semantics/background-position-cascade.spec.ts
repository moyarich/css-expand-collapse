import { it } from "vitest";
import { expectRoundTrip } from "./helpers.js";

it("preserves overlapping background and position declarations", () => {
  expectRoundTrip(".target { background-position-x: 30px; background: red; background-position-y: 50%; }");
});
