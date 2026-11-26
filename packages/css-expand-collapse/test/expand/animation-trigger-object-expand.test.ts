import { expect, it } from "vitest";
import { expandShorthands } from "../../src/index.js";

it("preserves authored animation-trigger in object expansion", () => {
  const expanded = expandShorthands({ "animation-trigger": "--reveal play", animation: "fade 1s" });
  expect(expanded["animation-trigger"]).toBe("--reveal play");
  expect(expanded["animation-name"]).toBe("fade");
  expect(expanded["animation-duration"]).toBe("1s");
  expect(expanded).not.toHaveProperty("animation");
});
