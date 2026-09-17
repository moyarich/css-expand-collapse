import { lexer } from "css-tree";
import type { ShorthandCollapseContext, ShorthandExpandContext } from "./module.js";

const TAB = 0x0009;                // U+0009  -  \t
const LINEFEED = 0x000A;           // U+000A  -  \n
const FORMFEED = 0x000C;           // U+000C  -  \f
const CARRIAGERETURN = 0x000D;     // U+000D  -  \r
const SPACE = 0x0020;              // U+0020  -  space
const QUOTATIONMARK = 0x0022;      // U+0022  -  "
const APOSTROPHE = 0x0027;         // U+0027  -  '
const LEFTPARENTHESIS = 0x0028;    // U+0028  -  (
const RIGHTPARENTHESIS = 0x0029;   // U+0029  -  )
const COMMA = 0x002C;              // U+002C  -  ,
const SOLIDUS = 0x002F;            // U+002F  -  /
const LEFTSQUAREBRACKET = 0x005B;  // U+005B  -  [
const REVERSESOLIDUS = 0x005C;     // U+005C  -  \
const RIGHTSQUAREBRACKET = 0x005D; // U+005D  -  ]

const CSS_WHITESPACE = new Set([TAB, LINEFEED, FORMFEED, CARRIAGERETURN, SPACE]);

function splitTopLevel(
  value: string,
  separatorCode: number | null,
  omitEmpty = false,
): string[] {
  const parts: string[] = [];
  const source = value.trim();
  let current = "";
  let quoteCode = 0;
  let escaped = false;
  let parenDepth = 0;
  let bracketDepth = 0;

  const pushCurrent = () => {
    const part = current.trim();
    if (!omitEmpty || part) parts.push(part);
    current = "";
  };

  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index);
    const char = source[index]!;

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (code === REVERSESOLIDUS) {
      current += char;
      escaped = true;
      continue;
    }

    if (quoteCode) {
      current += char;
      if (code === quoteCode) quoteCode = 0;
      continue;
    }

    if (code === APOSTROPHE || code === QUOTATIONMARK) {
      quoteCode = code;
      current += char;
      continue;
    }

    if (code === LEFTPARENTHESIS) parenDepth += 1;
    if (code === RIGHTPARENTHESIS) parenDepth = Math.max(0, parenDepth - 1);
    if (code === LEFTSQUAREBRACKET) bracketDepth += 1;
    if (code === RIGHTSQUAREBRACKET) bracketDepth = Math.max(0, bracketDepth - 1);

    const isSeparator = separatorCode === null
      ? CSS_WHITESPACE.has(code)
      : code === separatorCode;

    if (isSeparator && parenDepth === 0 && bracketDepth === 0) {
      pushCurrent();
    } else {
      current += char;
    }
  }

  pushCurrent();
  return parts;
}

export const splitTopLevelWhitespace = (value: string): string[] =>
  splitTopLevel(value, null, true);

export const splitTopLevelSlash = (value: string): string[] =>
  splitTopLevel(value, SOLIDUS);

export const splitTopLevelComma = (value: string): string[] =>
  splitTopLevel(value, COMMA);

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
