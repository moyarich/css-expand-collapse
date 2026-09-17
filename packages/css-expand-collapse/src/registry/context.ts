import { lexer } from "css-tree";
import type { ShorthandCollapseContext, ShorthandExpandContext } from "./module.js";

export function splitTopLevel(value: string, separator: string): string[] {
  const parts: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let escaped = false;
  let parenDepth = 0;
  let bracketDepth = 0;

  const push = () => {
    parts.push(current.trim());
    current = "";
  };

  for (const char of value.trim()) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }
    if (char === "(") parenDepth += 1;
    if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
    if (char === "[") bracketDepth += 1;
    if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);

    if (char === separator && parenDepth === 0 && bracketDepth === 0) {
      push();
    } else {
      current += char;
    }
  }

  push();
  return parts;
}

export function splitTopLevelWhitespace(value: string): string[] {
  const result: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let escaped = false;
  let parenDepth = 0;
  let bracketDepth = 0;

  const push = () => {
    const token = current.trim();
    if (token) result.push(token);
    current = "";
  };

  for (const char of value.trim()) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }
    if (char === "(") parenDepth += 1;
    if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
    if (char === "[") bracketDepth += 1;
    if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);

    if (/\s/.test(char) && parenDepth === 0 && bracketDepth === 0) {
      push();
    } else {
      current += char;
    }
  }

  push();
  return result;
}

export const splitTopLevelSlash = (value: string): string[] => splitTopLevel(value, "/");
export const splitTopLevelComma = (value: string): string[] => splitTopLevel(value, ",");

export function matchProperty(property: string, value: string): boolean {
  try {
    const result = lexer.matchProperty(property, value) as unknown as {
      matched?: unknown;
      error?: unknown;
    };
    return Boolean(result.matched) && !result.error;
  } catch {
    return false;
  }
}

export const shorthandExpandContext: ShorthandExpandContext = {
  matchProperty,
  splitWhitespace: splitTopLevelWhitespace,
  splitSlash: splitTopLevelSlash,
};

export const shorthandCollapseContext: ShorthandCollapseContext = {
  matchProperty,
};
