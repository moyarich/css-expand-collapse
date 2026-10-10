import {
  expandShorthands,
  styleToDeclarations,
} from "@moyarich/css-expand-collapse";

// expandShorthands() expands every supported shorthand in a declaration map.
// Non-shorthand declarations, such as color, pass through unchanged.
const declarations = {
  margin: "10px 20px",
  padding: "0 0 8px",
  inset: "0",
  flex: "0 1 auto",
  "flex-flow": "column nowrap",
  color: "red",
};

console.group("Plain declaration map");
console.log(expandShorthands(declarations));
console.groupEnd();

// element.style preserves authored inline shorthands, unlike getComputedStyle(),
// which generally exposes resolved longhands. Convert it before expansion.
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

const styleDeclarations = styleToDeclarations(element.style);

console.group("Inline style");
console.log(expandShorthands(styleDeclarations));
console.groupEnd();
