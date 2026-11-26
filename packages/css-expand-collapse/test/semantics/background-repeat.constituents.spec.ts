import { expect, it } from "vitest";
import { validateProperty } from "../../src/index.js";
import { expectEquivalent } from "./helpers.js";

it("compares background-repeat with its specified constituents when available", ({ skip }) => {
  const property = "background-repeat";
  const value = "repeat-x";
  const parts = [["background-repeat-x","repeat"],["background-repeat-y","no-repeat"]] as const;
  const grammar = [validateProperty(property, value).valid, ...parts.map(([name, token]) => validateProperty(name, token).valid)];
  const supported = CSS.supports(property, value) && parts.every(([name, token]) => CSS.supports(name, token));
  console.info("shorthand constituent audit", JSON.stringify({ property, grammar, supported }));
  if (!supported) {
    skip("Browser does not expose all specified constituents");
    return;
  }
  expect(CSS.supports(property, value)).toBe(true);
  const base = ".target{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;width:80px;background-image:linear-gradient(red,blue);";
  const markup = '<div class="target" lang="ja">日本語 ABC 123 日本語 ABC 123 日本語 ABC 123</div>';
  expectEquivalent(base + property + ":" + value + "}", base + parts.map(([name, token]) => name + ":" + token).join(";") + "}", markup);
});
