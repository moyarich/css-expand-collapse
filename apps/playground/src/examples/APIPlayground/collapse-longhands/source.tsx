import {
  collapseLonghands,
  styleToDeclarations,
} from "@moyarich/css-expand-collapse";

// Plain declaration map
const declarations = {
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
  color: "red",
};

console.log(collapseLonghands(declarations));

// Browser computed styles
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

  console.log(collapseLonghands(computedDeclarations));
} finally {
  element.remove();
}
