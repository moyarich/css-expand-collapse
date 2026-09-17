import { collapseQuad } from "../collapsers.js";
import { expandQuad } from "../expanders.js";
import { quad } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = quad("border").map((property) => `${property}-width`);
const initialValues = ["medium", "medium", "medium", "medium"] as const;
const expand = expandQuad(longhands);

const collapse = collapseQuad(longhands);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
