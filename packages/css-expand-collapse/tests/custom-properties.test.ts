import { describe, expect, it } from "vitest";
import {
  collapseCss,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  resolveCustomProperties,
} from "../src/index.js";

describe("custom property resolution", () => {
  it("resolves nested var() references and fallbacks", () => {
    expect(resolveCustomProperties(
      "calc(var(--space) * 2)",
      {
        "--space": "var(--base)",
        "--base": "8px",
      },
    )).toBe("calc(8px * 2)");

    expect(resolveCustomProperties(
      "var(--missing, var(--fallback))",
      { "--fallback": "red" },
    )).toBe("red");
  });

  it("keeps custom property names case-sensitive", () => {
    expect(resolveCustomProperties("var(--Color)", {
      "--Color": "red",
      "--color": "blue",
    })).toBe("red");

    expect(resolveCustomProperties("var(--COLOR)", {
      "--Color": "red",
    }, {
      allowFallbackForMissing: false,
    })).toBeNull();
  });

  it("uses a fallback for an explicitly invalid cyclic variable", () => {
    expect(resolveCustomProperties(
      "var(--color, rebeccapurple)",
      { "--color": "var(--color)" },
    )).toBe("rebeccapurple");
  });
});

describe("custom properties in property transforms", () => {
  it("expands a single-component custom property while preserving var()", () => {
    expect(expandShorthand("border-color", "var(--color)", {
      customProperties: { "--color": "red" },
    })?.declarations).toEqual({
      "border-top-color": "var(--color)",
      "border-right-color": "var(--color)",
      "border-bottom-color": "var(--color)",
      "border-left-color": "var(--color)",
    });
  });

  it("does not expand a multi-component variable into incompatible longhands", () => {
    expect(expandShorthand("margin", "var(--space)", {
      customProperties: { "--space": "8px 16px" },
    })).toBeNull();
  });

  it("collapses variable longhands when the resolved value validates the shorthand", () => {
    expect(collapseToShorthand("border-color", {
      "border-top-color": "var(--color)",
      "border-right-color": "var(--color)",
      "border-bottom-color": "var(--color)",
      "border-left-color": "var(--color)",
    }, {
      fillMissingLonghands: false,
      customProperties: { "--color": "red" },
    })?.value).toBe("var(--color)");
  });

  it("collects local custom properties from declaration maps without lowercasing them", () => {
    expect(expandShorthands({
      "--Color": "red",
      "border-color": "var(--Color)",
    })).toEqual({
      "--Color": "red",
      "border-top-color": "var(--Color)",
      "border-right-color": "var(--Color)",
      "border-bottom-color": "var(--Color)",
      "border-left-color": "var(--Color)",
    });
  });
});

describe("custom property scope in stylesheet transforms", () => {
  it("uses :root variables to expand background while preserving the reference", () => {
    const css = expandCss(`
      :root {
        --bg-color: rgb(10 20 30);
      }

      .card {
        background: var(--bg-color);
      }
    `);

    expect(css).toMatch(/--bg-color:\s*rgb\(10 20 30\)/);
    expect(css).toContain("background-color:var(--bg-color)");
    expect(css).toContain("background-image:none");
    expect(css).not.toContain("background:var(--bg-color)");
  });

  it("uses html and :host as root custom-property scopes", () => {
    const documentCss = expandCss(`
      html { --color: red; }
      .card { border-color: var(--color); }
    `);
    expect(documentCss).toContain("border-top-color:var(--color)");

    const shadowCss = expandCss(`
      :host { --color: blue; }
      .card { border-color: var(--color); }
    `);
    expect(shadowCss).toContain("border-top-color:var(--color)");
  });

  it("lets a local custom property override a root value", () => {
    const css = expandCss(`
      :root { --color: red; }
      .card {
        --color: blue;
        border-color: var(--color);
      }
    `);

    expect(css).toMatch(/--color:\s*blue/);
    expect(css).toContain("border-top-color:var(--color)");
  });

  it("preserves a shorthand when a known variable expands to multiple components", () => {
    const css = expandCss(`
      :root { --space: 8px 16px; }
      .card { margin: var(--space); }
    `);

    expect(css).toContain("margin:var(--space)");
    expect(css).not.toContain("margin-top");
  });

  it("does not assume an unknown fallback is the final cascaded value", () => {
    const css = expandCss(`
      .card { border-color: var(--external-color, red); }
    `);

    expect(css).toContain("border-color:var(--external-color,red)");
    expect(css).not.toContain("border-top-color");
  });

  it("collapses longhands that use a root-scoped variable", () => {
    const css = collapseCss(`
      :root { --color: red; }
      .card {
        border-top-color: var(--color);
        border-right-color: var(--color);
        border-bottom-color: var(--color);
        border-left-color: var(--color);
      }
    `);

    expect(css).toContain("border-color:var(--color)");
    expect(css).not.toContain("border-top-color");
  });

  it("uses background-color var() when deciding whether background can collapse", () => {
    const css = collapseCss(`
      :root { --bg-color: rgb(10 20 30); }
      .card {
        background-image: none;
        background-position: 0% 0%;
        background-size: auto auto;
        background-repeat: repeat;
        background-origin: padding-box;
        background-clip: border-box;
        background-attachment: scroll;
        background-color: var(--bg-color);
      }
    `);

    expect(css).toContain("background:");
    expect(css).toContain("var(--bg-color)");
    expect(css).not.toContain("background-color:");
  });
});
