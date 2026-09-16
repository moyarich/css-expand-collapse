import { generate, List, parse, walk } from "css-tree";
import {
  collapseToShorthand,
  expandShorthand,
  type CssomOptions,
  type DeclarationMap,
} from "./core.js";
import { SHORTHAND_DEFINITIONS } from "./registry.js";

export type TransformMode = "expand" | "collapse";

export interface TransformCssOptions extends CssomOptions {
  mode: TransformMode;
}

function makeDeclaration(property: string, value: string, important = false): any {
  return parse(`${property}:${value}${important ? "!important" : ""}`, {
    context: "declaration",
  });
}

function declarationValue(node: any): string {
  return generate(node.value).trim();
}

function expandBlock(children: any[], options?: CssomOptions): any[] {
  const output: any[] = [];
  for (const child of children) {
    if (child.type !== "Declaration") {
      output.push(child);
      continue;
    }
    const expanded = expandShorthand(child.property, declarationValue(child), options);
    if (!expanded) {
      output.push(child);
      continue;
    }
    for (const [property, value] of Object.entries(expanded)) {
      output.push(makeDeclaration(property, value, Boolean(child.important)));
    }
  }
  return output;
}

const COLLAPSE_CANDIDATES = Object.entries(SHORTHAND_DEFINITIONS)
  .filter(([, definition]) => definition.longhands.length > 0)
  .sort(([, a], [, b]) => b.longhands.length - a.longhands.length);

function tryCollapseAt(children: any[], index: number, options?: CssomOptions): {
  node: any;
  length: number;
} | null {
  for (const [shorthand, definition] of COLLAPSE_CANDIDATES) {
    const length = definition.longhands.length;
    const slice = children.slice(index, index + length);
    if (slice.length !== length || slice.some((node) => node.type !== "Declaration")) continue;

    const important = Boolean(slice[0]!.important);
    if (slice.some((node) => Boolean(node.important) !== important)) continue;

    const expected = new Set(definition.longhands);
    const actual = new Set(slice.map((node) => node.property.toLowerCase()));
    if (actual.size !== expected.size || [...actual].some((property) => !expected.has(property))) continue;

    const declarations: DeclarationMap = {};
    for (const node of slice) {
      declarations[node.property.toLowerCase()] = declarationValue(node);
    }

    const collapsed = collapseToShorthand(shorthand, declarations, options);
    if (!collapsed) continue;
    return {
      node: makeDeclaration(collapsed.property, collapsed.value, important),
      length,
    };
  }
  return null;
}

function collapseBlock(children: any[], options?: CssomOptions): any[] {
  const output: any[] = [];
  for (let index = 0; index < children.length;) {
    const collapsed = tryCollapseAt(children, index, options);
    if (collapsed) {
      output.push(collapsed.node);
      index += collapsed.length;
    } else {
      output.push(children[index]);
      index += 1;
    }
  }
  return output;
}

function replaceChildren(block: any, children: any[]): void {
  const list = new List();
  for (const child of children) list.appendData(child);
  block.children = list;
}

export function transformCss(css: string, options: TransformCssOptions): string {
  const ast: any = parse(css, { context: "stylesheet" });

  walk(ast, {
    visit: "Block",
    enter(block: any) {
      const children = block.children.toArray();
      const transformed = options.mode === "expand"
        ? expandBlock(children, options)
        : collapseBlock(children, options);
      replaceChildren(block, transformed);
    },
  });

  return generate(ast);
}

export function expandCss(css: string, options?: CssomOptions): string {
  return transformCss(css, { ...options, mode: "expand" });
}

export function collapseCss(css: string, options?: CssomOptions): string {
  return transformCss(css, { ...options, mode: "collapse" });
}

function transformDeclarationBlock(
  declarations: string,
  mode: TransformMode,
  options?: CssomOptions,
): string {
  const selector = ".__css_expand_collapse__";
  const output = transformCss(`${selector}{${declarations}}`, { ...options, mode });
  const open = output.indexOf("{");
  const close = output.lastIndexOf("}");
  return open === -1 || close === -1 ? output : output.slice(open + 1, close);
}

export function expandDeclarations(declarations: string, options?: CssomOptions): string {
  return transformDeclarationBlock(declarations, "expand", options);
}

export function collapseDeclarations(declarations: string, options?: CssomOptions): string {
  return transformDeclarationBlock(declarations, "collapse", options);
}
