import { expect, it } from "vitest";
import { expandCss, expandShorthand } from "../../src/index.js";

it("preserves excluded animation trigger (multiple)", () => {
  const source = ".target{animation-trigger:--first play,--second play pause;animation:1s first,2s second}";
  const expanded = expandCss(source);
  expect(expanded).toContain("animation-duration:");
  const triggers = [...expanded.matchAll(/animation-trigger:([^;}]+)/g)].map((match) => match[1]);
  expect(triggers).toEqual(["--first play,--second play pause"]);
  expect(expandShorthand("animation", "1s example")?.declarations).not.toHaveProperty("animation-trigger");
});
