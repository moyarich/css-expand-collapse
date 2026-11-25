import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for mask position percentages", ({ skip }) => {
  const value = "linear-gradient(black, transparent) 20% 80%";
  if (!CSS.supports("mask", value)) skip("Browser does not support this value");
  const css = `.target { mask: ${value}; }`;
  const expanded = expandCss(css);
  expect(expanded).not.toBe(css);
  expect(expanded).toContain("mask-position:");
  expect(expanded).not.toMatch(/(?:[;{])\s*mask\s*:/);
  expectRoundTrip(css);
});
