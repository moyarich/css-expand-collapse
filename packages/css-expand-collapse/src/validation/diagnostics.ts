import type {
  ValidationDiagnostic,
  ValidationLocation,
  ValidationResult,
} from "./types.js";

export function validationResult(
  diagnostics: ValidationDiagnostic[],
): ValidationResult {
  return {
    valid: diagnostics.some((item) => item.severity === "error")
      ? false
      : diagnostics.length
        ? null
        : true,
    diagnostics,
  };
}

export function syntaxDiagnostic(
  error: unknown,
  location?: ValidationLocation,
): ValidationDiagnostic {
  const details = error as {
    message?: string;
    line?: number;
    column?: number;
    offset?: number;
  };
  const position =
    typeof details.line === "number" &&
    typeof details.column === "number" &&
    typeof details.offset === "number"
      ? {
          line: details.line,
          column: details.column,
          offset: details.offset,
        }
      : undefined;
  return {
    code: "invalid-syntax",
    severity: "error",
    message: details.message ?? String(error),
    location: location ?? (position && { start: position, end: position }),
  };
}
