import { describe, expect, it } from "vitest";
import {
  hasCssomSupport,
  supportsRuntimeTransform,
} from "../src/index.js";

describe("runtime compatibility", () => {
  it("supports all transformable shorthands without a DOM", () => {
    expect(hasCssomSupport()).toBe(false);
    expect(supportsRuntimeTransform("margin")).toBe(true);
    expect(supportsRuntimeTransform("background")).toBe(true);
    expect(supportsRuntimeTransform("animation")).toBe(true);
    expect(supportsRuntimeTransform("font")).toBe(true);
    expect(supportsRuntimeTransform("grid")).toBe(true);
  });

  it("keeps the deprecated CSSOM capability helper source-compatible", () => {
    const style = {} as CSSStyleDeclaration;

    expect(hasCssomSupport({ style })).toBe(true);
    expect(supportsRuntimeTransform("background", { style })).toBe(true);
  });

  it("rejects unknown properties", () => {
    expect(supportsRuntimeTransform("not-a-real-shorthand")).toBe(false);
  });
});
