import { expect, it } from "vitest";
import { expandDeclarations } from "../../src/index.js";

it("important expansion", () => {
  expect(expandDeclarations("padding:1px 2px!important")).toBe("padding-top:1px!important;padding-right:2px!important;padding-bottom:1px!important;padding-left:2px!important");
});
