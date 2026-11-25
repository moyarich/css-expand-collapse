import { expect, it } from "vitest";
import { validateProperty } from "../../src/index.js";

it("accepts unregistered custom property token values", () => {
  expect(validateProperty("--Theme", "red blue").valid).toBe(true);
});
