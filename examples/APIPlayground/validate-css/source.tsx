import { validateCss } from "@moyarich/css-expand-collapse";

const result = validateCss(`
  .card {
    padding: 8px;
    @media (min-width: 40rem) {
      margin: var(--space);
      color: 12px;
    }
  }
`, {
  customProperties: { "--space": "16px" },
});

console.log(result.valid);
console.table(result.diagnostics);
