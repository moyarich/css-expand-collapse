import { expect, it } from "vitest";
import {
  collapseToShorthand,
  expandShorthand,
  supportsTransform,
} from "../../src/index.js";

it("expands grid auto-flow without browser CSSOM", () => {
  expect(
    expandShorthand("grid", "auto-flow 100px / 1fr 1fr")?.declarations,
  ).toEqual({
    "grid-auto-columns": "auto",
    "grid-auto-flow": "row",
    "grid-auto-rows": "100px",
    "grid-template-areas": "none",
    "grid-template-columns": "1fr 1fr",
    "grid-template-rows": "none",
  });
});
