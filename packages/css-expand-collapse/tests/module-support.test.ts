import { describe, expect, it } from "vitest";
import {
  collapseToShorthand,
  expandShorthand,
  supportsPureTransform,
  supportsTransform,
} from "../src/index.js";

describe("module-owned shorthand transforms", () => {
  it("reports CSSTree-backed shorthands as runtime-neutral", () => {
    expect(supportsTransform("flex")).toBe(true);
    expect(supportsPureTransform("flex")).toBe(true);

    expect(supportsTransform("background")).toBe(true);
    expect(supportsPureTransform("background")).toBe(true);
  });

  it("expands and collapses flex without a DOM", () => {
    expect(expandShorthand("flex", "2 0 10rem")).toEqual({
      "flex-grow": "2",
      "flex-shrink": "0",
      "flex-basis": "10rem",
    });

    expect(expandShorthand("flex", "3")).toEqual({
      "flex-grow": "3",
      "flex-shrink": "1",
      "flex-basis": "0%",
    });

    expect(collapseToShorthand("flex", {
      "flex-grow": "0",
      "flex-shrink": "0",
      "flex-basis": "auto",
    })?.value).toBe("none");
  });

  it("supports unordered component shorthands", () => {
    expect(expandShorthand("columns", "18rem 3")).toEqual({
      "column-width": "18rem",
      "column-count": "3",
    });

    expect(collapseToShorthand("columns", {
      "column-width": "18rem",
      "column-count": "3",
    })?.value).toBe("18rem 3");
  });

  it("supports slash-pair shorthands", () => {
    expect(expandShorthand("container", "sidebar / inline-size")).toEqual({
      "container-name": "sidebar",
      "container-type": "inline-size",
    });

    expect(expandShorthand("grid-column", "2 / span 3")).toEqual({
      "grid-column-start": "2",
      "grid-column-end": "span 3",
    });

    expect(collapseToShorthand("grid-column", {
      "grid-column-start": "2",
      "grid-column-end": "span 3",
    })?.value).toBe("2 / span 3");
  });

  it("supports logical border-axis shorthands", () => {
    expect(expandShorthand("border-block", "2px solid red")).toEqual({
      "border-block-start-width": "2px",
      "border-block-start-style": "solid",
      "border-block-start-color": "red",
      "border-block-end-width": "2px",
      "border-block-end-style": "solid",
      "border-block-end-color": "red",
    });

    expect(collapseToShorthand("border-block", {
      "border-block-start-width": "2px",
      "border-block-start-style": "solid",
      "border-block-start-color": "red",
      "border-block-end-width": "2px",
      "border-block-end-style": "solid",
      "border-block-end-color": "red",
    })?.value).toBe("2px solid red");
  });
});
