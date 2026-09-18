import {
  expandShorthands,
  styleToDeclarations,
} from "@moyarich/css-expand-collapse";

// Plain declaration map
const declarations = {
  margin: "10px 20px",
  padding: "0 0 8px",
  inset: "0",
  flex: "0 1 auto",
  "flex-flow": "column nowrap",
  color: "red",
};

console.log(expandShorthands(declarations));

// Browser inline styles
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
const result = expandShorthands(styleDeclarations);

console.log(result);
