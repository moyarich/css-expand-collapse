import { validateProperty } from "@moyarich/css-expand-collapse";

console.log(validateProperty("margin", "10px 20px"));
console.log(validateProperty("padding", "red"));
console.log(validateProperty("margin", "var(--space)"));
console.log(
  validateProperty("margin", "var(--space)", {
    customProperties: { "--space": "8px 16px" },
  }),
);
