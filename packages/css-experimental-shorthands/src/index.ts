import type { CssTransformerPlugin } from "@moyarich/css-expand-collapse";
import { backgroundRepeat, backgroundRepeatGrammars, backgroundRepeatPlugin } from "./background-repeat.js";

export { backgroundRepeat, backgroundRepeatGrammars, backgroundRepeatPlugin };

const experimentalShorthands: CssTransformerPlugin = {
  ...backgroundRepeatPlugin,
  name: "@moyarich/css-experimental-shorthands",
};

export default experimentalShorthands;
