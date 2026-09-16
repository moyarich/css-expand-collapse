import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("inset-block", { longhands: ["inset-block-start", "inset-block-end"], strategy: "pair", initialValues: ["auto", "auto"] });

export default shorthand;
