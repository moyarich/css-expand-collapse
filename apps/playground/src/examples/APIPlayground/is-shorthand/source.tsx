import { isShorthand } from "@moyarich/css-expand-collapse";

// isShorthand() reports whether the property has a registered shorthand module.
console.log("margin:", isShorthand("margin")); // true
console.log("margin-top:", isShorthand("margin-top")); // false
