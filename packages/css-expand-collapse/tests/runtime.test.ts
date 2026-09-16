import { describe, expect, it } from "vitest";
import {
  hasCssomSupport,
  supportsRuntimeTransform,
} from "../src/index.js";

describe("runtime compatibility", () => {
  it("supports pure transforms without a DOM", () => {
    expect(hasCssomSupport()).toBe(false);
    expect(supportsRuntimeTransform("margin")).toBe(true);
    expect(supportsRuntimeTransform("background")).toBe(false);
  });

  it("accepts an injected CSSStyleDeclaration for DOM-less extension contexts", () => {
    const style = {} as CSSStyleDeclaration;

    expect(hasCssomSupport({ style })).toBe(true);
    expect(supportsRuntimeTransform("background", { style })).toBe(true);
  });

  it("rejects unknown properties", () => {
    expect(supportsRuntimeTransform("not-a-real-shorthand")).toBe(false);
  });
});
