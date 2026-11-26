import { expect, it } from "vitest";
import { getModuleCapabilities, type ShorthandModule } from "../../src/index.js";

it("derives expand capabilities from active constituents and handlers", () => {
  const module: ShorthandModule = {
    longhands: new Map([["margin-top", "0"]]),
    expand: () => ({ "margin-top": "1px" }),
  };
  expect(getModuleCapabilities(module)).toEqual({ expand: true, collapse: false });
});
