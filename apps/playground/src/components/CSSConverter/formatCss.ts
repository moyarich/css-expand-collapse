export type InputKind = "stylesheet" | "declarations";

const QUOTATIONMARK = 0x0022;
const APOSTROPHE = 0x0027;
const LEFTPARENTHESIS = 0x0028;
const RIGHTPARENTHESIS = 0x0029;
const COLON = 0x003a;
const SEMICOLON = 0x003b;
const LEFTCURLYBRACKET = 0x007b;
const REVERSESOLIDUS = 0x005c;
const RIGHTCURLYBRACKET = 0x007d;
const CSS_WHITESPACE = new Set([0x0009, 0x000a, 0x000c, 0x000d, 0x0020]);

export function formatCss(css: string, inputKind: InputKind): string {
  const source = css.trim();
  if (!source) return "";

  let output = "";
  let indent = 0;
  let quoteCode = 0;
  let escaped = false;
  let parenDepth = 0;
  let pendingSpace = false;

  const writeIndent = () => {
    output += "  ".repeat(Math.max(0, indent));
  };

  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index);
    const char = source[index]!;

    if (escaped) {
      output += char;
      escaped = false;
      continue;
    }

    if (code === REVERSESOLIDUS) {
      output += char;
      escaped = true;
      continue;
    }

    if (quoteCode) {
      output += char;
      if (code === quoteCode) quoteCode = 0;
      continue;
    }

    if (code === APOSTROPHE || code === QUOTATIONMARK) {
      if (pendingSpace) {
        output += " ";
        pendingSpace = false;
      }
      quoteCode = code;
      output += char;
      continue;
    }

    if (code === LEFTPARENTHESIS) parenDepth += 1;
    if (code === RIGHTPARENTHESIS) parenDepth = Math.max(0, parenDepth - 1);

    if (CSS_WHITESPACE.has(code) && parenDepth === 0) {
      pendingSpace = true;
      continue;
    }

    if (code === LEFTCURLYBRACKET && parenDepth === 0) {
      output = output.trimEnd();
      output += " {\n";
      indent += 1;
      writeIndent();
      pendingSpace = false;
      continue;
    }

    if (code === SEMICOLON && parenDepth === 0) {
      output = output.trimEnd();
      output += ";\n";
      writeIndent();
      pendingSpace = false;
      continue;
    }

    if (code === RIGHTCURLYBRACKET && parenDepth === 0) {
      output = output.trimEnd();
      indent = Math.max(0, indent - 1);
      output += "\n";
      writeIndent();
      output += "}\n";
      writeIndent();
      pendingSpace = false;
      continue;
    }

    if (
      code === COLON &&
      parenDepth === 0 &&
      (inputKind === "declarations" || indent > 0)
    ) {
      output = output.trimEnd();
      output += ": ";
      pendingSpace = false;
      continue;
    }

    if (
      pendingSpace &&
      output &&
      !output.endsWith("\n") &&
      !output.endsWith(" ")
    ) {
      output += " ";
    }
    pendingSpace = false;
    output += char;
  }

  const formatted = output
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

  return inputKind === "declarations"
    ? formatted.replace(/^\s{2}/gm, "")
    : formatted;
}
