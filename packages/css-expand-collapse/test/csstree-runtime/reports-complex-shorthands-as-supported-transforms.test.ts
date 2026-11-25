import { expect, it } from "vitest";
import {
  collapseToShorthand,
  expandShorthand,
  supportsTransform,
} from "../../src/index.js";

it("reports complex shorthands as supported transforms", () => {
  for (const property of [
    "background",
    "mask",
    "animation",
    "transition",
    "font",
    "grid",
    "list-style",
    "offset",
    "text-emphasis",
  ]) {
    expect(supportsTransform(property)).toBe(true);
  }
});
