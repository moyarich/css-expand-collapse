import { expect, it } from "vitest";
import { getModuleCapabilities, type ShorthandModule } from "../../src/index.js";

it("derives none capabilities from active constituents and handlers", () => {
  const module: ShorthandModule = {
    longhands: new Map([["margin-top", "0"]]),
  };
  expect(getModuleCapabilities(module)).toEqual({ expand: false, collapse: false });
});
