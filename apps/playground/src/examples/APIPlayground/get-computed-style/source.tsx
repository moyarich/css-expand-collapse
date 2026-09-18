import {
  collapseLonghands,
  styleToDeclarations,
} from "@moyarich/css-expand-collapse";

const element = document.createElement("div");

element.style.cssText = `
  position: relative;
  inset: 0;
  display: flex;
  width: 80px;
  height: 88px;
  margin: 0;
  padding: 0 0 8px;
  gap: normal;
  flex: 0 1 auto;
  flex-flow: column nowrap;
  align-items: center;
`;

document.body.append(element);

try {
  const computedStyle = getComputedStyle(element);

  const declarations = styleToDeclarations(computedStyle, [
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "display",
    "width",
    "height",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "row-gap",
    "column-gap",
    "flex-grow",
    "flex-shrink",
    "flex-basis",
    "flex-direction",
    "flex-wrap",
    "align-items",
  ]);

  const result = collapseLonghands(declarations);

  console.log(result);
} finally {
  element.remove();
}
