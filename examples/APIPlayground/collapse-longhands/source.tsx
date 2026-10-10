import {
  collapseLonghands,
  styleToDeclarations,
} from "@moyarich/css-expand-collapse";

// collapseLonghands() works on a plain declaration map. Unrelated properties
// such as color are preserved while registered longhand groups are collapsed.
const declarations = {
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
  color: "red",
};

console.group("Plain declaration map");
console.log(collapseLonghands(declarations));
console.groupEnd();

// getComputedStyle() exposes resolved browser styles mostly as longhands.
// Convert that CSSStyleDeclaration to a DeclarationMap before collapsing it.
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
  const computedDeclarations = styleToDeclarations(computedStyle);

  console.group("Computed style");
  console.log(collapseLonghands(computedDeclarations));
  console.groupEnd();
} finally {
  element.remove();
}
