import { expect, it } from "vitest";
import { collapseToShorthand, expandShorthand } from "../../src/index.js";

it("uses declarations consistently across inverse operations", () => {
  const expanded = expandShorthand("inset", "0 0 0 auto");
  expect(expanded).toEqual({
    property: "inset",
    value: "0 0 0 auto",
    declarations: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "auto",
    },
  });

  const collapsed = collapseToShorthand("inset", expanded!.declarations);
  expect(collapsed).toEqual({
    property: "inset",
    value: "0 0 0 auto",
    declarations: expanded!.declarations,
    consumed: ["top", "right", "bottom", "left"],
  });
});
