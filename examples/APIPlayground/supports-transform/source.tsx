import { supportsTransform } from "@moyarich/css-expand-collapse";

// supportsTransform() checks whether a shorthand has an expansion/collapse
// implementation in the registry. A valid CSS property may still be unsupported.
console.log("background:", supportsTransform("background"));
console.log("animation:", supportsTransform("animation"));
console.log("margin-top:", supportsTransform("margin-top"));
