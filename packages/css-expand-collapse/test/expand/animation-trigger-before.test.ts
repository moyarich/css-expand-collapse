import { expect, it } from "vitest";
import { expandCss, expandShorthand } from "../../src/index.js";

it("preserves excluded animation trigger (before)", () => {
  const source = ".target{animation-trigger:--reveal play;animation:1s ease example}";
  const expanded = expandCss(source);
  expect(expanded).toContain("animation-duration:");
  const triggers = [...expanded.matchAll(/animation-trigger:([^;}]+)/g)].map((match) => match[1]);
  expect(triggers).toEqual(["--reveal play"]);
  expect(expandShorthand("animation", "1s example")?.declarations).not.toHaveProperty("animation-trigger");
});
