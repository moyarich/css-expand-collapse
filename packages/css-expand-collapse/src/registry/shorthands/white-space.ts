import type { ShorthandModule } from "../module.js";

const collapse = "white-space-collapse";
const wrap = "text-wrap-mode";
const trim = "white-space-trim";
const aliases: Record<string, [string, string]> = {
  normal: ["collapse", "wrap"],
  pre: ["preserve", "nowrap"],
  "pre-wrap": ["preserve", "wrap"],
  "pre-line": ["preserve-breaks", "wrap"],
};
const collapseValues = new Set([
  "collapse", "preserve", "preserve-breaks", "preserve-spaces",
  "break-spaces", "discard",
]);
const wrapValues = new Set(["wrap", "nowrap"]);

export default {
  // CSS Text 4 defines trim even though browsers currently implement only the
  // first two constituents. Reset it when expanding supported syntax.
  longhands: new Map([[collapse, "collapse"], [wrap, "wrap"], [trim, "none"]]),
  expand(value, context) {
    if (!context.matchProperty("white-space", value)) return null;
    const tokens = context.splitWhitespace(value.toLowerCase());
    const alias = tokens.length === 1 && Object.hasOwn(aliases, tokens[0]!)
      ? aliases[tokens[0]!] : undefined;
    if (alias) return { [collapse]: alias[0], [wrap]: alias[1], [trim]: "none" };
    let c: string | undefined;
    let w: string | undefined;
    for (const token of tokens) {
      if (!c && collapseValues.has(token)) c = token;
      else if (!w && wrapValues.has(token)) w = token;
      else return null;
    }
    return { [collapse]: c ?? "collapse", [wrap]: w ?? "wrap", [trim]: "none" };
  },
  collapse(declarations, context) {
    if (declarations[trim] !== "none") return null;
    const c = declarations[collapse];
    const w = declarations[wrap];
    if (!c || !w || !collapseValues.has(c) || !wrapValues.has(w)) return null;
    const alias = Object.entries(aliases).find(([, pair]) => pair[0] === c && pair[1] === w);
    const value = alias?.[0] ?? (c === "collapse" ? w : w === "wrap" ? c : c + " " + w);
    return context.matchProperty("white-space", value) ? value : null;
  },
} satisfies ShorthandModule;
