import { generate, parse, walk } from "css-tree";
import { syntaxDiagnostic, validationResult } from "./diagnostics.js";
import { validateProperty } from "./validateProperty.js";
import type {
  ValidationDiagnostic,
  ValidationOptions,
  ValidationResult,
} from "./types.js";

/** Shared parser for source-aware declaration validation. */
export function validateSource(
  source: string,
  context: "stylesheet" | "declarationList",
  options: ValidationOptions,
): ValidationResult {
  const diagnostics: ValidationDiagnostic[] = [];
  try {
    const ast = parse(source, {
      context,
      positions: true,
      onParseError(error) {
        diagnostics.push(syntaxDiagnostic(error));
      },
    });
    walk(ast, {
      visit: "Declaration",
      enter(node) {
        // Descriptors such as @font-face src are not ordinary CSS properties.
        // Check grammar only in style rules and declaration fragments.
        const value = generate(node.value);
        const location = node.value.loc ?? node.loc ?? undefined;
        if (this.atrule && !this.rule) {
          diagnostics.push({
            code: "unsupported-context",
            severity: "info",
            property: node.property,
            value,
            message: "At-rule descriptor grammar is not checked.",
            location,
          });
          return;
        }
        const result = validateProperty(node.property, value, options);
        for (const diagnostic of result.diagnostics) {
          diagnostics.push({ ...diagnostic, location });
        }
      },
    });
  } catch (error) {
    diagnostics.push(syntaxDiagnostic(error));
  }
  return validationResult(diagnostics);
}
