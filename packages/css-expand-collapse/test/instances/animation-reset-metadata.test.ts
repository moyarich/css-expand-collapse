import { expect, it } from "vitest";
import { getShorthandMetadata } from "../../src/index.js";

it("discovers excluded animation-trigger as a reset-only constituent", () => {
  expect(getShorthandMetadata("animation")?.resetOnlyLonghands).toContain("animation-trigger");
});
