import { describe, expect, it } from "vitest";
import {
  collapseStyleDeclaration,
  collapseCss,
  collapseLonghands,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  getLonghands,
  getShorthands,
  isLonghand,
  isShorthand,
} from "../src/index.js";

describe("property metadata", () => {
  it("recognizes shorthand and longhand relationships", () => {
    expect(isShorthand("margin")).toBe(true);
    expect(isShorthand("text-decoration")).toBe(true);
    expect(isLonghand("margin-top")).toBe(true);
    expect(getLonghands("margin")).toEqual([
      "margin-top",
      "margin-right",
      "margin-bottom",
      "margin-left",
    ]);
    expect(getShorthands("margin-top")).toContain("margin");
  });
});

describe("expandShorthand", () => {
  it("expands four-side shorthand values", () => {
    expect(expandShorthand("margin", "10px 20px")).toEqual({
      "margin-top": "10px",
      "margin-right": "20px",
      "margin-bottom": "10px",
      "margin-left": "20px",
    });
  });

  it("expands text-decoration regardless of component order", () => {
    expect(expandShorthand("text-decoration", "wavy underline purple 25%")).toEqual({
      "text-decoration-line": "underline",
      "text-decoration-style": "wavy",
      "text-decoration-color": "purple",
      "text-decoration-thickness": "25%",
    });
  });

  it("expands border components and fills shorthand defaults", () => {
    const result = expandShorthand("border", "2px solid red");
    expect(result?.["border-top-width"]).toBe("2px");
    expect(result?.["border-right-style"]).toBe("solid");
    expect(result?.["border-bottom-color"]).toBe("red");
    expect(result?.["border-left-width"]).toBe("2px");
  });

  it("rejects invalid values in generic shorthand expanders", () => {
    expect(expandShorthand("margin", "garbage")).toBeNull();
    expect(expandShorthand("gap", "garbage")).toBeNull();
    expect(expandShorthand("container", "sidebar / garbage")).toBeNull();
  });
});

describe("collapse", () => {
  const margin = {
    "margin-top": "10px",
    "margin-right": "20px",
    "margin-bottom": "10px",
    "margin-left": "20px",
  };

  it("collapses a requested shorthand", () => {
    expect(collapseToShorthand("margin", margin)).toMatchObject({
      property: "margin",
      value: "10px 20px",
    });
  });

  it("collapses a declaration object", () => {
    expect(collapseLonghands({ ...margin, color: "red" })).toEqual({
      color: "red",
      margin: "10px 20px",
    });
  });

  it("fills omitted object longhands with module-owned initial values by default", () => {
    expect(collapseToShorthand("inset", {
      top: "0",
      right: "0",
      bottom: "0",
    })).toEqual({
      property: "inset",
      value: "0 0 0 auto",
      consumed: ["top", "right", "bottom"],
      declarations: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "auto",
      },
    });
  });

  it("can require a complete object declaration map", () => {
    expect(collapseToShorthand("inset", {
      top: "0",
      right: "0",
      bottom: "0",
    }, {
      fillMissingLonghands: false,
    })).toBeNull();
  });

  it("rejects invalid shorthand serialization from longhand maps", () => {
    expect(collapseToShorthand("margin", {
      "margin-top": "garbage",
      "margin-right": "garbage",
      "margin-bottom": "garbage",
      "margin-left": "garbage",
    }, {
      fillMissingLonghands: false,
    })).toBeNull();
  });

  it("collapses a partial margin object using margin-top's initial value", () => {
    expect(collapseToShorthand("margin", {
      "margin-right": "24px",
      "margin-bottom": "12px",
      "margin-left": "67px",
    })).toEqual({
      property: "margin",
      value: "0 24px 12px 67px",
      consumed: ["margin-right", "margin-bottom", "margin-left"],
      declarations: {
        "margin-top": "0",
        "margin-right": "24px",
        "margin-bottom": "12px",
        "margin-left": "67px",
      },
    });
  });
});

describe("real CSS", () => {
  it("expands declarations inside a stylesheet", () => {
    const css = expandCss(`
      @media (min-width: 40rem) {
        .example { margin: 10px 20px; }
      }
    `);
    expect(css).toContain("margin-top:10px");
    expect(css).toContain("margin-right:20px");
    expect(css).toContain("margin-bottom:10px");
    expect(css).toContain("margin-left:20px");
  });

  it("collapses contiguous longhands without changing priority", () => {
    const css = collapseCss(`
      .example {
        margin-top: 10px;
        margin-right: 20px;
        margin-bottom: 10px;
        margin-left: 20px;
      }
    `);
    expect(css).toContain("margin:10px 20px");
    expect(css).not.toContain("margin-top");
  });

  it("honors source order when later longhands fully override an earlier shorthand", () => {
    const css = collapseCss(`
      .marker {
        position: relative;
        inset: auto;
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
      }
    `);

    expect(css).toContain("position:relative");
    expect(css).toContain("inset:0px");
    expect(css).not.toContain("inset:auto");
    expect(css).not.toContain("top:0px");
    expect(css).not.toContain("right:0px");
    expect(css).not.toContain("bottom:0px");
    expect(css).not.toContain("left:0px");
  });

  it("collapses computed-export CSS while preserving the final cascade result", () => {
    const css = collapseCss(`
      .marker {
        inset: auto;
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
        margin: 0px;
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 0px;
        margin-left: 0px;
        padding: 0px 0px 8px;
        padding-top: 0px;
        padding-right: 0px;
        padding-bottom: 8px;
        padding-left: 0px;
        border: 4px solid rgb(31, 111, 174);
        border-width: 4px;
        border-style: solid;
        border-color: rgb(31, 111, 174);
        border-top-width: 4px;
        border-right-width: 4px;
        border-bottom-width: 4px;
        border-left-width: 4px;
        border-top-style: solid;
        border-right-style: solid;
        border-bottom-style: solid;
        border-left-style: solid;
        border-top-color: rgb(31, 111, 174);
        border-right-color: rgb(31, 111, 174);
        border-bottom-color: rgb(31, 111, 174);
        border-left-color: rgb(31, 111, 174);
      }
    `);

    expect(css).toContain("inset:0px");
    expect(css).toContain("margin:0px");
    expect(css).toContain("padding:0px 0px 8px");
    expect(css).toContain("border:4px solid rgb(31,111,174)");
    expect(css).not.toContain("inset:auto");
    expect(css).not.toContain("margin-top");
    expect(css).not.toContain("padding-bottom");
    expect(css).not.toContain("border-width");
    expect(css).not.toContain("border-top-width");
  });

  it("collapses compatible longhands even when unrelated declarations are between them", () => {
    const css = collapseCss(`
      .example {
        align-items: center;
        align-self: auto;
        color: rebeccapurple;
        justify-items: normal;
        flex-direction: column;
        flex-grow: 0;
        flex-wrap: nowrap;
      }
    `);

    expect(css).toContain("place-items:center normal");
    expect(css).toContain("align-self:auto");
    expect(css).toContain("color:rebeccapurple");
    expect(css).toContain("flex-flow:column nowrap");
    expect(css).toContain("flex-grow:0");
    expect(css).not.toContain("align-items");
    expect(css).not.toContain("justify-items");
    expect(css).not.toContain("flex-direction");
    expect(css).not.toContain("flex-wrap");
  });

  it("collapses a fully overridden margin shorthand", () => {
    const css = collapseCss(`
      .example {
        margin: auto;
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 0px;
        margin-left: 0px;
      }
    `);

    expect(css).toContain("margin:0px");
    expect(css).not.toContain("margin:auto");
    expect(css).not.toContain("margin-top");
  });

  it("does not remove a shorthand when only part of it is overridden", () => {
    const css = collapseCss(`
      .example {
        inset: auto;
        top: 0px;
        right: 0px;
        bottom: 0px;
      }
    `);

    expect(css).toContain("inset:auto");
    expect(css).toContain("top:0px");
    expect(css).toContain("right:0px");
    expect(css).toContain("bottom:0px");
  });

  it("can collapse partial inset longhands by explicitly assuming missing sides are initial", () => {
    const css = collapseCss(`
      .example {
        top: 0;
        right: 0;
        bottom: 0;
      }
    `, {
      fillMissingLonghands: "initial",
    });

    expect(css).toContain("inset:0 0 0 auto");
    expect(css).not.toContain("top:0");
    expect(css).not.toContain("right:0");
    expect(css).not.toContain("bottom:0");
  });

  it("does not fill missing partial values across an earlier shorthand", () => {
    const css = collapseCss(`
      .example {
        inset: 1px 2px 3px 4px;
        top: 0;
        right: 0;
        bottom: 0;
      }
    `, {
      fillMissingLonghands: "initial",
    });

    expect(css).toContain("inset:1px 2px 3px 4px");
    expect(css).toContain("top:0");
    expect(css).toContain("right:0");
    expect(css).toContain("bottom:0");
  });

  it("honors !important when deciding whether later longhands override a shorthand", () => {
    const blocked = collapseCss(`
      .example {
        inset: auto !important;
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
      }
    `);

    expect(blocked).toContain("inset:auto!important");
    expect(blocked).not.toContain("inset:0px");

    const overriding = collapseCss(`
      .example {
        inset: auto;
        top: 0px !important;
        right: 0px !important;
        bottom: 0px !important;
        left: 0px !important;
      }
    `);

    expect(overriding).toContain("inset:0px!important");
    expect(overriding).not.toContain("inset:auto");
  });

  it("preserves same-property fallback declarations", () => {
    const css = collapseCss(`
      .example {
        display: -webkit-box;
        display: flex;
      }
    `);

    expect(css).toContain("display:-webkit-box");
    expect(css).toContain("display:flex");
  });
});

describe("style declarations", () => {
  it("can consume a read-only CSSStyleDeclaration-like object", () => {
    const values: Record<string, string> = {
      "margin-top": "10px",
      "margin-right": "20px",
      "margin-bottom": "10px",
      "margin-left": "20px",
    };
    const properties = Object.keys(values);
    const style = {
      length: properties.length,
      item: (index: number) => properties[index] ?? "",
      getPropertyValue: (property: string) => values[property] ?? "",
    };

    expect(collapseStyleDeclaration(style, "margin")).toMatchObject({
      property: "margin",
      value: "10px 20px",
    });
  });
});
