import { expect, it } from "vitest";
import { expandCss, expandShorthand } from "../../src/index.js";

it("applies animation trigger reset semantics (override)", () => {
  const source = ".target{animation:1s ease example;animation-trigger:--reveal play reset}";
  const expanded = expandCss(source);
  expect(expanded).toContain("animation-duration:");
  const triggers = [...expanded.matchAll(/animation-trigger:([^;}]+)/g)].map((match) => match[1]);
  expect(triggers.at(-1)).toBe("--reveal play reset");
  expect(expandShorthand("animation", "1s example")?.declarations["animation-trigger"]).toBe("none");
});
