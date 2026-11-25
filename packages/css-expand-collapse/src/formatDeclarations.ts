import { parse, type DeclarationList } from "css-tree";

export interface FormatDeclarationsOptions {
  indent?: string;
  separator?: string;
  trailingSemicolon?: boolean;
}

/**
 * Formats declaration fragments without changing declaration order or value tokens.
 * Invalid fragments are returned unchanged. Comments and whitespace inside values
 * are preserved; separators between declarations are controlled by the caller.
 */
export function formatDeclarations(
  css: string,
  options: FormatDeclarationsOptions = {},
): string {
  let invalid = false;
  try {
    const ast = parse(css, {
      context: "declarationList",
      positions: true,
      onParseError() {
        invalid = true;
      },
    }) as DeclarationList;
    if (invalid) return css;
    const declarations: string[] = [];
    let end = 0;
    for (const node of ast.children.toArray()) {
      if (node.type !== "Declaration" || !node.loc) return css;
      const start = node.loc.start.offset;
      const gap = css.slice(end, start);
      // Do not discard comments between declarations or other authored tokens.
      if (!/^[;\s]*$/.test(gap)) return css;
      const original = css.slice(start, node.loc.end.offset);
      const colon = original.indexOf(":");
      if (colon === -1) return css;
      declarations.push(
        (options.indent ?? "") +
          original.slice(0, colon).trim() +
          ": " +
          original.slice(colon + 1).trim(),
      );
      end = node.loc.end.offset;
    }
    if (!/^[;\s]*$/.test(css.slice(end))) return css;
    if (!declarations.length) return "";
    const separator = options.separator ?? "\n";
    return (
      declarations.join(";" + separator) +
      (options.trailingSemicolon === false ? "" : ";")
    );
  } catch {
    return css;
  }
}
