import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("contain-intrinsic-size", { longhands: ["contain-intrinsic-width", "contain-intrinsic-height"], strategy: "pair", initialValues: ["none", "none"] });

export default shorthand;
