import { isLonghand } from "@moyarich/css-expand-collapse";

// Registry checks are property-name based; no CSS value is required.
console.log("margin-top:", isLonghand("margin-top")); // true
console.log("margin:", isLonghand("margin")); // false
