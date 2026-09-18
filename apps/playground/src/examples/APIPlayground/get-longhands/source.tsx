import { getLonghands } from "@moyarich/css-expand-collapse";

// getLonghands() reads registry metadata; it does not parse a CSS value.
// The returned names are the longhand properties represented by the shorthand.
console.log(getLonghands("margin"));
