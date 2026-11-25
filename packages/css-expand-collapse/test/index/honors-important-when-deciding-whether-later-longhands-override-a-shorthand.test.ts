import { expect, it } from "vitest";
import {
  collapseStyleDeclaration,
  collapseCss,
  collapseLonghands,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  getLonghands,
  getShorthands,
  isLonghand,
  isShorthand,
} from "../../src/index.js";

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
