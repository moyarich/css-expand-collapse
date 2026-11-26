import type { CssTransformerPlugin } from "@moyarich/css-expand-collapse";
import { backgroundRepeat, backgroundRepeatGrammars } from "./background-repeat.js";
export { backgroundRepeat, backgroundRepeatGrammars };
const experimentalShorthands: CssTransformerPlugin = {
  name: "@moyarich/css-experimental-shorthands",
  shorthands: { "background-repeat": backgroundRepeat },
  grammars: backgroundRepeatGrammars,
  replaceRecognized: ["background-repeat"],
};
export default experimentalShorthands;
