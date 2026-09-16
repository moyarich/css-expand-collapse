import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("inset-inline", { longhands: ["inset-inline-start", "inset-inline-end"], strategy: "pair", initialValues: ["auto", "auto"] });

export default shorthand;
