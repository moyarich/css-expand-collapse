import { validateDeclarations } from "@moyarich/css-expand-collapse";

const result = validateDeclarations(`
  margin: 8px 16px;
  padding: red;
  color: var(--accent);
`);

console.log(result.valid);
console.table(result.diagnostics);
