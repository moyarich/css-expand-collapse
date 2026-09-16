import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("inset", { longhands: ["top", "right", "bottom", "left"], strategy: "quad", initialValues: ["auto", "auto", "auto", "auto"] });

export default shorthand;
