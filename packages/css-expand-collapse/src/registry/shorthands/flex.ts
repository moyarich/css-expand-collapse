import { defineShorthand } from "../define.js";

const shorthand = defineShorthand("flex", { longhands: ["flex-grow", "flex-shrink", "flex-basis"], strategy: "flex", initialValues: ["0", "1", "auto"] });

export default shorthand;
