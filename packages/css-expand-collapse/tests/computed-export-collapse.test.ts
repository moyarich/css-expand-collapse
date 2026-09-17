import { describe, expect, it } from "vitest";
import { collapseCss } from "../src/index.js";

describe("computed export shorthand collapse", () => {
  it("merges an earlier inset shorthand with a complete later computed longhand set", () => {
    const css = collapseCss(`
      .tip {
        inset: 0px auto auto 50%;
        top: 0px;
        right: -27.5px;
        bottom: -19.8px;
        left: 0px;
      }
    `);

    expect(css).toContain("inset:0px -27.5px -19.8px 0px");
    expect(css).not.toMatch(/[;{]top:/);
    expect(css).not.toMatch(/[;{]right:/);
    expect(css).not.toMatch(/[;{]bottom:/);
    expect(css).not.toMatch(/[;{]left:/);
  });

  it("removes computed background longhands with equivalent browser serialization", () => {
    const css = collapseCss(`
      .bubble {
        background: none;
        background-color: rgba(0, 0, 0, 0);
        background-image: none;
        background-position: 0% 0%;
        background-repeat: repeat;
        background-size: auto;
      }
    `);

    expect(css).toBe(".bubble{background:none}");
  });

  it("removes computed transition longhands despite comma whitespace differences", () => {
    const css = collapseCss(`
      .bubble {
        transition: translate 0.2s ease-out, scale 0.2s ease-out;
        transition-property: translate, scale;
        transition-duration: 0.2s, 0.2s;
        transition-timing-function: ease-out, ease-out;
      }
    `);

    expect(css).toContain("transition:translate 0.2s ease-out,scale 0.2s ease-out");
    expect(css).not.toContain("transition-property");
    expect(css).not.toContain("transition-duration");
    expect(css).not.toContain("transition-timing-function");
  });
});
