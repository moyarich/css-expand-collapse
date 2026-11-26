import { expect, it } from "vitest";
import { expandCss, expandShorthand } from "../../src/index.js";

it("applies animation trigger reset semantics (multiple)", () => {
  const source = ".target{animation-trigger:--first play,--second play pause;animation:1s first,2s second}";
  const expanded = expandCss(source);
  expect(expanded).toContain("animation-duration:");
  const triggers = [...expanded.matchAll(/animation-trigger:([^;}]+)/g)].map((match) => match[1]);
  expect(triggers.at(-1)).toBe("none");
  expect(expandShorthand("animation", "1s example")?.declarations["animation-trigger"]).toBe("none");
});
