import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("preserves computed CSS for background color lab", ({ skip }) => {
  const value = "lab(50% 40 -20)";
  if (!CSS.supports("background", value)) skip("Browser does not support this value");
  const css = `.target { background: ${value}; }`;
  const expanded = expandCss(css);
  expect(expanded).not.toBe(css);
  expect(expanded).toContain("background-color:");
  expect(expanded).not.toMatch(/(?:[;{])\s*background\s*:/);
  expectRoundTrip(css);
});
